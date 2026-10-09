import fs from 'node:fs';
import {randomBytes,randomInt,randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import {report} from './report.mjs';
import {httpCases} from './http-cases.mjs';

if (!process.argv.includes('--remote')) throw Error('Use --remote to permit temporary QA fixtures and cleanup.');
if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const make=(token=key)=>createClient(url,token,{auth:{persistSession:false,autoRefreshToken:false}});
const owner=make(process.env.SUPABASE_SERVICE_ROLE_KEY), anon=make(), admin=make(), user=make(), other=make();
const qa=report('database');
const suffix=Date.now().toString(), prefix=`qa-${suffix}`;
const users=[],restaurants=[],categories=[],posts=[];
const assertOk=result=>{assert.equal(result.error,null,'Operation should succeed');return result.data;};
const denied=result=>assert.equal(result.error?.code,'42501','Operation must be denied by permissions/RLS');
const noRows=result=>assert.deepEqual(assertOk(result),[],'Foreign rows must not be visible or mutable');
const createAccount=async(index)=>{
  const credentials={email:`${prefix}-${index}@example.com`,studentCode:`98${randomInt(0,100000000).toString().padStart(8,'0')}`,password:randomBytes(24).toString('base64url')};
  const created=assertOk(await owner.auth.admin.createUser({email:credentials.email,password:credentials.password,email_confirm:true,user_metadata:{student_code:credentials.studentCode,role:'ADMIN'}}));
  users.push(created.user.id);return {...credentials,id:created.user.id};
};
let fixture;
try {
  const [one,two]=[await createAccount(1),await createAccount(2)];
  const admin1Email = process.env.BOOTSTRAP_ADMIN_1_EMAIL || 'admin1@hanu.vn';
  const admin1Code = process.env.BOOTSTRAP_ADMIN_1_STUDENT_CODE || '2404060021';
  const admin2Email = process.env.BOOTSTRAP_ADMIN_2_EMAIL || 'admin2@hanu.vn';
  const admin2Code = process.env.BOOTSTRAP_ADMIN_2_STUDENT_CODE || '2404060034';
  const adminAccount=assertOk(await admin.auth.signInWithPassword({email:admin1Email,password:process.env.BOOTSTRAP_ADMIN_1_PASSWORD})).user;
  assertOk(await user.auth.signInWithPassword({email:one.email,password:one.password}));
  assertOk(await other.auth.signInWithPassword({email:two.email,password:two.password}));
  const admin2=make();
  await qa.run('DB01','Exactly two configured ADMIN profiles exist',async()=>{const rows=assertOk(await owner.from('profiles').select('student_code,role').eq('role','ADMIN'));assert.deepEqual(rows.map(r=>r.student_code).sort(),[admin1Code,admin2Code].sort());});
  await qa.run('DB02','Second configured ADMIN can authenticate',async()=>{assertOk(await admin2.auth.signInWithPassword({email:admin2Email,password:process.env.BOOTSTRAP_ADMIN_2_PASSWORD}));await admin2.auth.signOut({scope:'local'});});
  await qa.run('DB03','Signup trigger ignores user supplied ADMIN role and uses email local part',async()=>{const p=assertOk(await user.from('profiles').select('*').single());assert.equal(p.id,one.id);assert.equal(p.role,'USER');assert.equal(p.display_name,one.email.split('@')[0]);assert.equal(p.student_code,one.studentCode);assert.ok(!('password' in p));});
  await qa.run('DB04','Invalid MSSV is rejected by the database signup trigger',async()=>{const r=await owner.auth.admin.createUser({email:`${prefix}-invalid@example.com`,password:one.password,email_confirm:true,user_metadata:{student_code:'123'}});if(r.data.user)users.push(r.data.user.id);assert.ok(r.error,'Invalid MSSV must not create a user');});
  await qa.run('DB05','Duplicate MSSV is rejected during account creation',async()=>{const r=await owner.auth.admin.createUser({email:`${prefix}-duplicate@example.com`,password:one.password,email_confirm:true,user_metadata:{student_code:one.studentCode}});if(r.data.user)users.push(r.data.user.id);assert.ok(r.error,'Duplicate MSSV must not create a profile');});
  for (const table of ['profiles','check_ins','notifications','notification_reads','contact_messages','admin_audit_logs']) await qa.run(`DB-ANON-${table}`,`Anonymous cannot read ${table}`,async()=>denied(await anon.from(table).select('*').limit(1)));
  await qa.run('DB06','USER sees only own private profile',async()=>{const rows=assertOk(await user.from('profiles').select('id'));assert.deepEqual(rows,[{id:one.id}]);});
  await qa.run('DB07','USER can update own display name',async()=>{assertOk(await user.from('profiles').update({display_name:'QA display name'}).eq('id',one.id));assert.equal(assertOk(await owner.from('profiles').select('display_name').eq('id',one.id).single()).display_name,'QA display name');});
  for (const [field,value] of [['role','ADMIN'],['student_code','9999999999'],['id',randomUUID()]]) await qa.run(`DB-IDENTITY-${field}`,`USER cannot update identity field ${field}`,async()=>denied(await user.from('profiles').update({[field]:value}).eq('id',one.id)));
  await qa.run('DB08','USER cannot update another profile',async()=>noRows(await user.from('profiles').update({display_name:'Denied QA edit'}).eq('id',two.id).select('id')));
  await qa.run('DB09','ADMIN cannot read or update another private profile',async()=>{noRows(await admin.from('profiles').select('id').eq('id',one.id));noRows(await admin.from('profiles').update({display_name:'Denied admin edit'}).eq('id',one.id).select('id'));denied(await admin.from('profiles').update({role:'ADMIN'}).eq('id',one.id));});
  await qa.run('DB10','USER and ADMIN JWTs cannot use Supabase Auth Admin management',async()=>{assert.ok((await user.auth.admin.listUsers()).error);assert.ok((await admin.auth.admin.updateUserById(one.id,{user_metadata:{qa_denied:true}})).error);assert.ok((await admin.auth.admin.deleteUser(two.id)).error);});

  const category=assertOk(await admin.from('categories').insert({name:`QA ${suffix}`,slug:prefix}).select('id').single());categories.push(category.id);
  const restaurant=assertOk(await admin.from('restaurants').insert({name:`QA Restaurant ${suffix}`,is_active:true}).select('id').single());restaurants.push(restaurant.id);
  const secondRestaurant=assertOk(await admin.from('restaurants').insert({name:`QA Hidden ${suffix}`,is_active:false}).select('id').single());restaurants.push(secondRestaurant.id);
  const firstDish=assertOk(await admin.from('dishes').insert({restaurant_id:restaurant.id,name:'Bún QA',price_text:'70,000',price_min_vnd:70000,price_max_vnd:70000}).select('id').single());
  const inactiveDish=assertOk(await admin.from('dishes').insert({restaurant_id:restaurant.id,name:'Inactive QA',is_active:false}).select('id').single());
  const wrongDish=assertOk(await admin.from('dishes').insert({restaurant_id:secondRestaurant.id,name:'Wrong restaurant QA'}).select('id').single());
  assertOk(await admin.from('restaurant_categories').insert({restaurant_id:restaurant.id,category_id:category.id}));
  fixture={owner,anon,admin,user,other,one,two,restaurant,secondRestaurant,firstDish,inactiveDish,wrongDish,category,adminId:adminAccount.id,prefix,tracked:{restaurants,categories,posts},base:process.argv.find(arg=>arg.startsWith('--base='))?.slice(7)||'http://127.0.0.1:3001'};
  await qa.run('DB11','ADMIN can create and link restaurant, category and dishes',async()=>{assertOk(await admin.from('restaurants').select('id').eq('id',restaurant.id).single());assert.equal(assertOk(await admin.from('dishes').select('id').eq('restaurant_id',restaurant.id)).length,2);assert.equal(assertOk(await admin.from('restaurant_categories').select('*').eq('restaurant_id',restaurant.id)).length,1);});
  for (const [table,payload] of [['restaurants',{name:`Denied ${suffix}`}],['categories',{name:'Denied',slug:`denied-${suffix}`}],['dishes',{restaurant_id:restaurant.id,name:'Denied'}],['blog_posts',{slug:`denied-${suffix}`,title:'Denied',content:'Denied',author_admin_id:one.id}],['site_settings',{key:`qa_${suffix}`,value:{qa:true}}]]) await qa.run(`DB-WRITE-${table}`,`USER cannot create ${table}`,async()=>denied(await user.from(table).insert(payload)));
  await qa.run('DB12','USER cannot update or delete restaurant content',async()=>{noRows(await user.from('restaurants').update({name:'Denied'}).eq('id',restaurant.id).select('id'));noRows(await user.from('dishes').delete().eq('id',firstDish.id).select('id'));});
  await qa.run('DB13','Anonymous sees active restaurant, hides inactive restaurant and dishes',async()=>{assertOk(await anon.from('restaurants').select('id').eq('id',restaurant.id).single());noRows(await anon.from('restaurants').select('id').eq('id',secondRestaurant.id));noRows(await anon.from('dishes').select('id').in('id',[inactiveDish.id,wrongDish.id]));});
  await qa.run('DB14','ADMIN can update content and deactivate/reactivate a restaurant',async()=>{assertOk(await admin.from('restaurants').update({description:'QA updated',is_active:false}).eq('id',restaurant.id));noRows(await anon.from('restaurants').select('id').eq('id',restaurant.id));assertOk(await admin.from('restaurants').update({is_active:true}).eq('id',restaurant.id));});
  await qa.run('DB15','Database enforces valid coordinates and paired values',async()=>{for(const values of [{latitude:91,longitude:105},{latitude:21,longitude:null}])assert.equal((await admin.from('restaurants').update(values).eq('id',restaurant.id)).error?.code,'23514');});
  await qa.run('DB16','Database enforces dish price range and restaurant foreign key',async()=>{assert.equal((await admin.from('dishes').update({price_min_vnd:70000,price_max_vnd:69999}).eq('id',firstDish.id)).error?.code,'23514');assert.equal((await admin.from('dishes').insert({restaurant_id:randomUUID(),name:'Invalid QA'})).error?.code,'23503');});
  await qa.run('DB17','Search RPC is accent insensitive and honors exact price 70000',async()=>{const rows=assertOk(await anon.rpc('search_restaurants',{query:'bun qa',max_price_vnd:70000,limit_count:100}));assert.ok(rows.some(row=>row.id===restaurant.id));assert.ok(!assertOk(await anon.rpc('search_restaurants',{query:'bun qa',max_price_vnd:69999,limit_count:100})).some(row=>row.id===restaurant.id));});
  await qa.run('DB18','ADMIN content writes create audit records without credential metadata',async()=>{const rows=assertOk(await admin.from('admin_audit_logs').select('metadata').in('entity_id',[restaurant.id,firstDish.id,category.id]));assert.ok(rows.length>=3);assert.ok(!/password|access_token|service_role/i.test(JSON.stringify(rows)));});
  await qa.run('DB19','USER cannot read audit log or run analytics',async()=>{noRows(await user.from('admin_audit_logs').select('id'));assert.equal((await user.rpc('admin_analytics')).error?.code,'42501');});
  const baseline=assertOk(await admin.rpc('admin_analytics'));
  let visit,review;
  await qa.run('DB20','USER can create own check-in with a valid active dish',async()=>{visit=assertOk(await user.from('check_ins').insert({user_id:one.id,restaurant_id:restaurant.id,dish_id:firstDish.id}).select('id').single());});
  await qa.run('DB21','Check-in rejects mismatched and inactive dishes',async()=>{for(const dishId of [wrongDish.id,inactiveDish.id])assert.ok((await user.from('check_ins').insert({user_id:one.id,restaurant_id:restaurant.id,dish_id:dishId})).error,'Selected dish must be active and belong to this restaurant');});
  await qa.run('DB22','Check-in rejects inactive restaurants and spoofed user IDs',async()=>{denied(await user.from('check_ins').insert({user_id:one.id,restaurant_id:secondRestaurant.id}));denied(await other.from('check_ins').insert({user_id:one.id,restaurant_id:restaurant.id}));});
  await qa.run('DB23','USER can read and update own check-in',async()=>{assertOk(await user.from('check_ins').select('id').eq('id',visit.id).single());assertOk(await user.from('check_ins').update({dish_id:null}).eq('id',visit.id));});
  await qa.run('DB24','Another USER and ADMIN cannot read, update or delete private check-in',async()=>{for(const client of [other,admin]){noRows(await client.from('check_ins').select('id').eq('id',visit.id));noRows(await client.from('check_ins').update({dish_id:null}).eq('id',visit.id).select('id'));noRows(await client.from('check_ins').delete().eq('id',visit.id).select('id'));}assertOk(await owner.from('check_ins').select('id').eq('id',visit.id).single());});
  await qa.run('DB25','Existing visit remains readable after its dish is deactivated',async()=>{assertOk(await user.from('check_ins').update({dish_id:firstDish.id}).eq('id',visit.id));assertOk(await admin.from('dishes').update({is_active:false}).eq('id',firstDish.id));assertOk(await user.from('check_ins').select('id').eq('id',visit.id).single());assertOk(await user.from('check_ins').update({visited_at:new Date().toISOString()}).eq('id',visit.id));assertOk(await admin.from('dishes').update({is_active:true}).eq('id',firstDish.id));});
  await qa.run('DB26','USER can create review; rating constraints and uniqueness are enforced',async()=>{review=assertOk(await user.from('reviews').insert({user_id:one.id,restaurant_id:restaurant.id,rating:5,comment:'QA review'}).select('id').single());assert.equal((await user.from('reviews').insert({user_id:one.id,restaurant_id:restaurant.id,rating:5,comment:'Duplicate QA'})).error?.code,'23505');for(const rating of [0,6])assert.equal((await other.from('reviews').insert({user_id:two.id,restaurant_id:restaurant.id,rating,comment:'Invalid QA'})).error?.code,'23514');});
  await qa.run('DB27','Reviews are public but another USER or ADMIN cannot edit or delete them',async()=>{assertOk(await anon.from('reviews').select('id').eq('id',review.id).single());for(const client of [other,admin]){noRows(await client.from('reviews').update({comment:'Denied edit'}).eq('id',review.id).select('id'));noRows(await client.from('reviews').delete().eq('id',review.id).select('id'));}});
  await qa.run('DB28','USER can update own review and data stays text',async()=>{assertOk(await user.from('reviews').update({comment:'QA <script>alert(1)</script>',rating:4}).eq('id',review.id));assert.equal(assertOk(await owner.from('reviews').select('rating').eq('id',review.id).single()).rating,4);});
  await qa.run('DB29','ADMIN analytics equals source count deltas and exposes aggregates only',async()=>{const stats=assertOk(await admin.rpc('admin_analytics'));assert.equal(stats.total_check_ins,baseline.total_check_ins+1);assert.equal(stats.total_reviews,baseline.total_reviews+1);assert.ok(!/"(?:user_id|student_code|email)"/.test(JSON.stringify(stats)));});
  await qa.run('DB30','USER can delete own review and check-in',async()=>{assertOk(await user.from('reviews').delete().eq('id',review.id));assertOk(await user.from('check_ins').delete().eq('id',visit.id));noRows(await owner.from('reviews').select('id').eq('id',review.id));noRows(await owner.from('check_ins').select('id').eq('id',visit.id));});

  let post,notice;
  await qa.run('DB31','ADMIN draft Blog is hidden from anonymous and regular USER',async()=>{post=assertOk(await admin.from('blog_posts').insert({slug:prefix,title:`QA Test ${suffix}`,content:'Temporary QA test. This will be removed.',author_admin_id:adminAccount.id,status:'draft'}).select('id,slug').single());posts.push(post.id);noRows(await anon.from('blog_posts').select('id').eq('id',post.id));noRows(await user.from('blog_posts').select('id').eq('id',post.id));});
  await qa.run('DB32','Publishing Blog creates exactly one global notification and timestamp',async()=>{assertOk(await admin.from('blog_posts').update({status:'published'}).eq('id',post.id));const rows=assertOk(await owner.from('notifications').select('id,audience').eq('blog_post_id',post.id));assert.equal(rows.length,1);assert.equal(rows[0].audience,'ALL_USERS');notice=rows[0];assert.ok(assertOk(await anon.from('blog_posts').select('published_at').eq('id',post.id).single()).published_at);});
  await qa.run('DB33','All USER accounts can read the new global notification',async()=>{for(const client of [user,other])assertOk(await client.from('notifications').select('id').eq('id',notice.id).single());});
  await qa.run('DB34','Editing and republishing Blog updates link without duplicate notifications',async()=>{assertOk(await admin.from('blog_posts').update({slug:prefix+'-edited',title:'QA edited'}).eq('id',post.id));assert.equal(assertOk(await owner.from('notifications').select('link').eq('blog_post_id',post.id).single()).link,`/blog/${prefix}-edited`);assertOk(await admin.from('blog_posts').update({status:'draft'}).eq('id',post.id));assertOk(await admin.from('blog_posts').update({status:'published'}).eq('id',post.id));assert.equal(assertOk(await owner.from('notifications').select('id').eq('blog_post_id',post.id)).length,1);});
  await qa.run('DB35','Mark-read is idempotent and each USER has independent read state',async()=>{for(let i=0;i<2;i++)assertOk(await user.from('notification_reads').upsert({notification_id:notice.id,user_id:one.id},{onConflict:'notification_id,user_id',ignoreDuplicates:true}));assert.equal(assertOk(await user.from('notification_reads').select('notification_id').eq('notification_id',notice.id)).length,1);noRows(await other.from('notification_reads').select('*').eq('notification_id',notice.id));noRows(await admin.from('notification_reads').select('*').eq('user_id',one.id));});
  await qa.run('DB36','USER cannot mark another USER notification state or create global notifications',async()=>{denied(await other.from('notification_reads').insert({notification_id:notice.id,user_id:one.id}));denied(await user.from('notifications').insert({type:'QA',title:'Denied',message:'Denied'}));});
  await qa.run('DB37','USER can send contact only with own user ID and cannot read private inbox',async()=>{assertOk(await user.from('contact_messages').insert({user_id:one.id,name:'QA',email:one.email,message:'Temporary QA message'}));denied(await other.from('contact_messages').insert({user_id:one.id,name:'QA',email:one.email,message:'Denied'}));denied(await user.from('contact_messages').select('*'));});
  await qa.run('DB38','ADMIN can delete a Blog and anonymous cannot read the deleted post',async()=>{assertOk(await owner.from('notifications').delete().eq('blog_post_id',post.id));assertOk(await admin.from('blog_posts').delete().eq('id',post.id));noRows(await anon.from('blog_posts').select('id').eq('id',post.id));});

  await httpCases(fixture);
} catch {
  qa.blocked('DB-SETUP','Complete dependent database and HTTP cases','A required fixture or runtime setup failed; inspect PASS/FAIL cases above.');
  console.error('QA setup or integration stage failed; no credentials are included in this output.');
  process.exitCode=1;
} finally {
  await qa.run('DB-CLEANUP','All temporary QA accounts and owned content are removed',async()=>{
    for(const userId of users)assertOk(await owner.auth.admin.deleteUser(userId));
    for(const postId of posts){assertOk(await owner.from('notifications').delete().eq('blog_post_id',postId));assertOk(await owner.from('blog_posts').delete().eq('id',postId));}
    for(const restaurantId of restaurants)assertOk(await owner.from('restaurants').delete().eq('id',restaurantId));
    for(const categoryId of categories)assertOk(await owner.from('categories').delete().eq('id',categoryId));
    if(users.length)noRows(await owner.from('profiles').select('id').in('id',users));
    if(restaurants.length)noRows(await owner.from('restaurants').select('id').in('id',restaurants));
    await admin.auth.signOut({scope:'local'});
  });
  qa.save();
  if(qa.cases.some(test=>test.status==='FAIL'))process.exitCode=1;
}
