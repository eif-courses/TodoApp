export default defineEventHandler(async (event) => {
    const db = useDatabase();

    const { title, isDone, email } = await readBody(event);

    if (!title || !email) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid input data. 'title' and 'email' are required.",
        });
    }

    const isDoneValue = isDone ? 1 : 0;

    await db.sql`
        INSERT INTO Todos (title, isDone, email)
        VALUES (${title}, ${isDoneValue}, ${email});
    `;

    return { message: "Todo created successfully!" };
});