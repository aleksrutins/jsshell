var color = function(c, s) {
  return `<span style='color: ${c}'>${s}</span>`;
};
window.shell = {
  varRegex: /\$(\w+)/g,
  colorRegex: /\\color\((.*?)\s*\|\s*(.*?)\)/g,
  out: console,
  color: color,
  vars: {PS1: `${color('green', 'somebody@nobody.everybody')} ${color('cyan', '/pretend/path')}$ `},
  onCommand() {},
  commands: {
    "meep": {
      "code": "echo meep",
      "parsed": true
    },
    "echo": {
      "code": function(shell, argv) {
        shell.out.log(argv.join(" "));
      },
      "parsed": false
    },
    "define": {
      "code": function(shell, argv) {
        var code = argv.slice(1).join(' ');
        shell.commands[argv[0]] = {
          "code": code,
          "parsed": true
        };
        shell.out.log("Created function " + argv[0]);
      },
      "parsed": false
    },
    "view": {
      "code": function (shell, argv) {
        var cmd = shell.commands[argv[0]]? shell.commands[argv[0]] : "ERROR: Invalid command";
        if(typeof(cmd) == 'string') {
          shell.out.log(cmd);
          return;
        }
        if(cmd.parsed) {
          shell.out.log(cmd.code);
        } else {
          shell.out.log("[[native code]]");
        }
      },
      "parsed": false
    },
    "clear": {
      "code": function(shell, argv) {
        (shell.out.clear !== (void 0)? shell.out.clear() : shell.out.log("Cannot clear viewport."));
      }
    },
    "defjs": {
      "code": function(shell, argv) {
        var name = argv[0], def = argv.slice(1).join(" ");
        shell.commands[name] = {
          "code": eval(def),
          "parsed": false
        };
      },
      "parsed": false
    },
    "set": {
      "code": function(shell, argv) {
        if(argv[1] != 'to') {
          shell.out.log("ERROR: Expected 'to' after variable name.");
          return;
        }
        shell.vars[argv[0]] = eval(argv.slice(2).join(" "));
      },
      "parsed": false
    },
    "list": {
      code: function(shell, argv) {
        for (var key in shell.commands) {
          if (shell.commands.hasOwnProperty(key)) {
            shell.out.log(key);
          }
        }
      }
    }
  },
  runLines: function(lines) {
    for(let line of lines.split("\n")) {
      this.run(line);
    }
  },
  run: function(line, echo) {
    echo = (echo != null? echo : true);
    if(echo) {
      shell.out.log(shell.vars.PS1 + line);
    }
    if(line.split(' ')[0] !== 'define') {
      line = line.replace(this.varRegex, (all, name) => {
        if(this.vars[name]) {
          return this.vars[name];
        }
        this.out.log("ERROR: No variable named " + name);
        return "";
      });
    }
    line = line.replace(this.colorRegex, (all, color, str) => {
      return this.color(color, str);
    })
    let segments = line.split(" ");
    if(this.commands[segments[0]] != null) {
      let cmd = this.commands[segments[0]];
      if(cmd.parsed) {
        for(var s in segments) {
          this.vars[s] = segments[s];
        }
        this.run(cmd.code, false);
        for(var s in segments) {
          delete this.vars[s];
        }
      } else {
        cmd.code(this, segments.slice(1));
      }
    } else {
      this.out.log("ERROR: Unknown command: " + segments[0]);
    }
    this.onCommand(this);
  }
}
