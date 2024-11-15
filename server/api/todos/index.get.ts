export default defineEventHandler(async (event) => {
    const db = useDatabase();

    const query = getQuery(event);
    const email = query.email as string;

    if (!email) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid email parameter. It must be a non-empty string.",
        });
    }

    const result = await db.sql`
        SELECT * FROM Todos where email = ${email}
    `;

    const todos = result.rows || [];

    return { todos };
});