const COMMANDS = ["UPDATE", "DELETE", "CREATE"];
const isAllow = (command) => (COMMANDS.includes(command.toUpperCase()) ? true : false);
module.exports=isAllow