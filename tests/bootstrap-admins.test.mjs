import test from "node:test";
import assert from "node:assert/strict";
import { ensureAdmin, INITIAL_ADMINS } from "../scripts/bootstrap-admins.ts";

function fakeAdmin() {
  const users = [];
  const profiles = new Map();
  const admin = {
    auth: {
      admin: {
        async listUsers() { return { data: { users }, error: null }; },
        async createUser(input) {
          const user = { id: `user-${users.length + 1}`, email: input.email, user_metadata: input.user_metadata, password: input.password };
          users.push(user);
          profiles.set(user.id, { id: user.id, student_code: input.user_metadata.student_code, role: "USER" });
          return { data: { user }, error: null };
        },
        async updateUserById(id, input) {
          const user = users.find((item) => item.id === id);
          user.user_metadata = input.user_metadata;
          return { error: null };
        },
      },
    },
    from(table) {
      assert.equal(table, "profiles");
      return {
        select() {
          return {
            eq(column, value) {
              return {
                async maybeSingle() {
                  const row = [...profiles.values()].find((item) => item[column] === value);
                  return { data: row ?? null, error: null };
                },
              };
            },
          };
        },
        async upsert(row) {
          profiles.set(row.id, { ...profiles.get(row.id), ...row });
          return { error: null };
        },
      };
    },
  };
  return { admin, users, profiles };
}

test("bootstrap creates once and preserves the existing password", async () => {
  const { admin, users, profiles } = fakeAdmin();
  const seed = INITIAL_ADMINS[0];
  assert.equal(await ensureAdmin(admin, seed, "strong-password-123"), "created");
  assert.equal(await ensureAdmin(admin, seed), "updated");
  assert.equal(users.length, 1);
  assert.equal(users[0].password, "strong-password-123");
  assert.deepEqual(profiles.get(users[0].id), {
    id: users[0].id,
    student_code: seed.studentCode,
    display_name: "linhphamhn342",
    role: "ADMIN",
  });
});

test("bootstrap refuses a conflicting MSSV instead of changing an account", async () => {
  const { admin, users, profiles } = fakeAdmin();
  users.push({ id: "existing", email: INITIAL_ADMINS[0].email, user_metadata: {}, password: "untouched" });
  profiles.set("existing", { id: "existing", student_code: "9999999999", role: "USER" });
  await assert.rejects(ensureAdmin(admin, INITIAL_ADMINS[0]), /differs/);
  assert.equal(profiles.get("existing").role, "USER");
});
