"use client";

import { deleteCheckIn } from "@/features/history/actions";

export function DeleteCheckInForm({ id }: { id: string }) {
  return (
    <form
      action={deleteCheckIn}
      onSubmit={(e) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa lần ăn này khỏi nhật ký không?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="button button-secondary text-xs cursor-pointer hover:border-red-300 hover:text-red-700 transition"
      >
        Xóa
      </button>
    </form>
  );
}
