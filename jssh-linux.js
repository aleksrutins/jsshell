var linux = (function () {
  function promptReset(shell) {
    shell.vars.PS1 = `${shell.color('green', `${shell.vars.uname}@${shell.vars.hname}`)} ${shell.color('cyan', shell.vars.path)}$ `;
  }
  var cmds = {
    "linux-session": {
      "code": function (shell, argv) {
        shell.vars.uname = "js";
        shell.vars.hname = "jssh.web";
        shell.vars.path = "/";
        promptReset(shell);
        shell.onCommand = promptReset;
        shell.fs = {
          "home": {
            "js": {
              "README": "This is a test file system."
            }
          }
        }
        shell.vars.folder = shell.fs;
      }
    },
    "cd": {
      "code": function (shell, argv) {
        if(argv[0][0] == '.') {
          shell.vars.path = shell.vars.path + argv[0].slice(shell.vars.path == "/"? argv[0].slice(2) : argv[0].slice(1));
          return;
        }
        shell.vars.path = argv[0];
      }
    },
    "pwd": {
      code: "echo $path",
      parsed: true
    }
  };
  return function(shell) {
    for (var key in cmds) {
      if (cmds.hasOwnProperty(key)) {
        shell.commands[key] = cmds[key];
      }
    }
  }
})();
