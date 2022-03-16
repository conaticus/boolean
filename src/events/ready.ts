module.exports = {
    name: "ready",
    once: true,
    execute(client: any) {
        console.log(`Logged in as ${client.user.tag}.`);
    },
};
