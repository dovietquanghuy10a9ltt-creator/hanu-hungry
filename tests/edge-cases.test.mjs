import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, validatePassword, safeReturnPath } from '../lib/auth/validation.ts';
import { parseRestaurantForm, parseCategoryForm, parseDishForm, parseBlogForm } from '../features/admin/validation.ts';
import { filterCatalog, dishSuggestions, normalizeSearch, parseMaxPrice } from '../features/restaurants/search.ts';
import { mapsUrl, readableText, formatVnd } from '../features/restaurants/format.ts';
import { historyStats } from '../features/history/stats.ts';
import { pickRandom } from '../features/gacha/random.ts';

const id = '11111111-1111-4111-8111-111111111111';
const form = (values) => { const result = new FormData(); for (const [key,value] of Object.entries(values)) for (const item of Array.isArray(value) ? value : [value]) result.append(key,String(item)); return result; };
const restaurant = (values = {}) => parseRestaurantForm(form({name:'Quán QA',...values}));
const dish = (values = {}) => parseDishForm(form({restaurant_id:id,name:'Món QA',...values}));
const blog = (values = {}) => parseBlogForm(form({slug:'qa-post',title:'QA',content:'Nội dung QA',status:'draft',...values}));
const catalog = [
  {id:'a',name:'Quán cơm',categories:['Cơm'],category_slugs:['com'],dishes:[{id:'d1',name:'Bún bò',price_min_vnd:70000},{id:'d2',name:'Bánh mì',price_min_vnd:25000}]},
  {id:'b',name:'Quán trà',categories:['Đồ uống'],category_slugs:['tra'],dishes:[{id:'d3',name:'Trà đào',price_min_vnd:null}]},
];

test('U01 email validation rejects malformed, whitespace and overlong addresses', () => {
  assert.ok(isValidEmail('qa@example.com'));
  for (const invalid of ['','qa','qa@','@example.com','qa @example.com','qa@example','a'.repeat(255)+'@e.co']) assert.equal(isValidEmail(invalid),false);
});
test('U02 password bounds are exactly 8 to 72 characters', () => {
  for (const length of [0,7,73]) assert.ok(validatePassword('a'.repeat(length)));
  for (const length of [8,72]) assert.equal(validatePassword('a'.repeat(length)),null);
});
test('U03 return paths preserve internal query and fragment', () => assert.equal(safeReturnPath('/restaurants?q=bun#menu'),'/restaurants?q=bun#menu'));
test('U04 return paths reject control characters and external destinations', () => {
  for (const value of ['https://evil.example','//evil.example','/\\evil.example','/\r\nLocation: https://evil.example','/\u0000evil']) assert.equal(safeReturnPath(value),'/');
});
test('U05 restaurant name is trimmed and capped at 180 characters', () => {
  assert.equal(restaurant({name:'  Quán QA  '}).data.data.name,'Quán QA');
  for (const name of ['', ' ', 'a'.repeat(181)]) assert.equal(restaurant({name}).ok,false);
});
test('U06 restaurant coordinates require a valid pair', () => {
  assert.ok(restaurant({latitude:'0',longitude:'0'}).ok);
  for (const values of [{latitude:21},{longitude:105},{latitude:91,longitude:105},{latitude:21,longitude:181},{latitude:'NaN',longitude:105}]) assert.equal(restaurant(values).ok,false);
});
test('U07 category links deduplicate and reject invalid identifiers', () => {
  assert.deepEqual(restaurant({category_ids:[id,id]}).data.categoryIds,[id]);
  assert.equal(restaurant({category_ids:'not-a-uuid'}).ok,false);
});
test('U08 restaurant photo URLs accept HTTP(S), reject executable schemes', () => {
  assert.ok(restaurant({image_url:'https://example.com/restaurant.jpg'}).ok);
  for (const image_url of ['javascript:alert(1)','data:image/svg+xml,anything','ftp://example.com/a','a'.repeat(2001)]) assert.equal(restaurant({image_url}).ok,false);
});
test('U09 category slugs normalize case and reject malformed names', () => {
  assert.equal(parseCategoryForm(form({name:'Bún',slug:'BUN-BO'})).data.slug,'bun-bo');
  for (const slug of ['', '-bun','bun-', 'bun--bo','bún', 'a'.repeat(101)]) assert.equal(parseCategoryForm(form({name:'Bún',slug})).ok,false);
});
test('U10 dish requires a valid parent restaurant and a name', () => {
  for (const values of [{restaurant_id:'not-a-uuid'},{name:''},{name:'a'.repeat(201)}]) assert.equal(dish(values).ok,false);
});
test('U11 missing dish prices stay null, clear zero and equal bounds remain valid', () => {
  assert.equal(dish().data.price_min_vnd,null);
  assert.ok(dish({price_min_vnd:0,price_max_vnd:0}).ok);
  assert.ok(dish({price_min_vnd:70000,price_max_vnd:70000}).ok);
});
test('U12 dish price rejects negative, fractional, non-finite and inverted ranges', () => {
  for (const values of [{price_min_vnd:-1},{price_min_vnd:1.5},{price_min_vnd:'Infinity'},{price_min_vnd:1000000001},{price_max_vnd:70000},{price_min_vnd:70000,price_max_vnd:69999}]) assert.equal(dish(values).ok,false);
});
test('U13 original per-unit price is retained', () => assert.equal(dish({price_text:'25,000/đĩa'}).data.price_text,'25,000/đĩa'));
test('U14 Blog requires slug, title, content and explicit supported status', () => {
  assert.ok(blog().ok);
  for (const values of [{slug:''},{title:''},{content:''},{status:'admin'},{slug:'../other'},{title:'a'.repeat(201)}]) assert.equal(blog(values).ok,false);
});
test('U15 Blog cover rejects executable schemes and overlong excerpt', () => {
  assert.equal(blog({cover_image_url:'javascript:alert(1)'}).ok,false);
  assert.equal(blog({excerpt:'a'.repeat(501)}).ok,false);
});
test('U16 budget accepts one dong through ten million with exact integer bounds', () => {
  for (const value of ['1','70000','70001','10000000']) assert.equal(parseMaxPrice(value),Number(value));
  for (const value of ['0','-1','1e3','10000001']) assert.equal(parseMaxPrice(value),undefined);
});
test('U17 accent normalization covers uppercase D-stroke and whitespace', () => assert.equal(normalizeSearch('  ĐẬU BÚN  '),'dau bun'));
test('U18 price and category filters work independently', () => {
  assert.equal(filterCatalog(catalog,'','com').length,1);
  assert.equal(filterCatalog(catalog,'','',25000).length,1);
  assert.equal(filterCatalog(catalog,'','unknown').length,0);
});
test('U19 matching restaurant names still obey budget and exclude unknown prices', () => {
  assert.equal(filterCatalog(catalog,'Quán cơm','',25000).length,1);
  assert.equal(filterCatalog(catalog,'Quán trà','',70000).length,0);
});
test('U20 literal wildcard characters do not match all catalog entries', () => {
  for (const query of ['%','_','[','; DROP TABLE restaurants']) assert.equal(filterCatalog(catalog,query,'').length,0);
});
test('U21 suggestion ranking prefers prefix matches and caps at six', () => {
  const many=[{...catalog[0],dishes:Array.from({length:10},(_,i)=>({id:String(i),name:i===0?'Cơm bún':'Bún '+i,price_min_vnd:30000}))}];
  const results=dishSuggestions(many,'bun');
  assert.equal(results.length,6); assert.ok(results.every(item=>item.name.startsWith('Bún')));
});
test('U22 suggestions omit prices above budget and preserve source input', () => {
  const before=JSON.stringify(catalog);
  assert.deepEqual(dishSuggestions(catalog,'bun',69999),[]);
  assert.equal(JSON.stringify(catalog),before);
});
test('U23 missing display values never render literal sentinels', () => {
  for (const value of [null,undefined,'','None',' null ','undefined','N/A','-']) assert.equal(readableText(value),'Thông tin đang được cập nhật');
  assert.equal(formatVnd(Number.NaN),'Chưa có dữ liệu giá');
});
test('U24 missing Maps sentinels do not create invented locations', () => {
  assert.equal(mapsUrl({address_text:'None'}),null);
  assert.equal(mapsUrl({address_text:'undefined',plus_code:'XQPW+WH8 Hà Nội'}),`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('XQPW+WH8 Hà Nội')}`);
});
test('U25 Maps safely encodes special location text and accepts real zero coordinates', () => {
  assert.equal(mapsUrl({latitude:0,longitude:0}), 'https://www.google.com/maps/search/?api=1&query=0,0');
  assert.equal(mapsUrl({address_text:'A & B #1'}),`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('A & B #1')}`);
});
test('U26 empty history has all zero statistics', () => assert.deepEqual(historyStats([],new Date('2026-10-01T05:00:00Z')),{total:0,currentStreak:0,longestStreak:0,weeklyVisits:0,weeklyRestaurants:0}));
test('U27 duplicate visits on one day count once toward streak', () => {
  const entries=[{restaurant_id:'a',visited_at:'2026-10-01T00:00:00Z'},{restaurant_id:'b',visited_at:'2026-10-01T05:00:00Z'}];
  const result=historyStats(entries,new Date('2026-10-01T10:00:00Z'));
  assert.equal(result.currentStreak,1); assert.equal(result.total,2); assert.equal(result.weeklyRestaurants,2);
});
test('U28 weekly recap starts Monday in Vietnam, excludes next week', () => {
  const result=historyStats([{restaurant_id:'a',visited_at:'2026-09-27T16:59:00Z'},{restaurant_id:'b',visited_at:'2026-09-27T17:00:00Z'},{restaurant_id:'c',visited_at:'2026-10-05T00:00:00Z'}],new Date('2026-10-01T05:00:00Z'));
  assert.equal(result.weeklyVisits,1); assert.equal(result.weeklyRestaurants,1);
});
test('U29 a gap breaks current streak while retaining longest streak', () => {
  const result=historyStats([{restaurant_id:'a',visited_at:'2026-09-26T10:00:00Z'},{restaurant_id:'a',visited_at:'2026-09-27T10:00:00Z'}],new Date('2026-10-01T05:00:00Z'));
  assert.equal(result.currentStreak,0); assert.equal(result.longestStreak,2);
});
test('U30 Gacha returns only actual candidates without mutating the list', () => {
  const choices=[{id:'a'},{id:'b'},{id:'c'}];
  for (let i=0;i<200;i++) assert.ok(choices.includes(pickRandom(choices)));
  assert.deepEqual(choices,[{id:'a'},{id:'b'},{id:'c'}]);
});
