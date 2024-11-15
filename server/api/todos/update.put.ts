import {useDatabase} from "nitropack/runtime";

export default defineEventHandler(async (event) => {
    const db = useDatabase();
    const { id, isDone } = await readBody(event);

    if (!id || isDone === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid data. Both id and isDone are required.",
        });
    }

    const isDoneValue = isDone ? 1 : 0;

    await db.sql`
    UPDATE Todos SET isDone = ${isDoneValue} WHERE id = ${id}
  `;

    return { ok: true, message: 'Todo updated successfully' };
});