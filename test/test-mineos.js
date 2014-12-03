var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var mineos = require('../mineos');
var test = exports;

var BASE_DIR = '/var/games/minecraft';
var FS_DELAY_MS = 200;

var OWNER_CREDS = {
  uid: 1000,
  gid: 1001
}

test.tearDown = function(callback) {
  var server_list = new mineos.server_list(BASE_DIR);

  for (var i in server_list) {
    var instance = new mineos.mc(server_list[i], BASE_DIR);

    fs.removeSync(instance.env.cwd);
    fs.removeSync(instance.env.bwd);
    fs.removeSync(instance.env.awd);
  }
  callback();
}

/*test.server_list = function (test) {
  var servers = mineos.server_list(BASE_DIR);
  var instance = new mineos.mc('testing', BASE_DIR);

  instance.create(OWNER_CREDS, function(err, did_create) {
    servers = mineos.server_list(BASE_DIR);
    test.ifError(err);
    test.ok(servers instanceof Array, "server returns an array");
    test.done();
  })
};

test.server_list_up = function(test) {
  var servers = mineos.server_list_up();
  test.ok(servers instanceof Array);

  for (var i=0; i < servers.length; i++) {
    test.ok(/^(?!\.)[a-zA-Z0-9_\.]+$/.test(servers[i]));
  }

  test.done();
}

test.is_server = function(test) {
  //tests if sp exists
  var instance = new mineos.mc('testing', BASE_DIR);

  async.series([
    function(callback) {
      instance.property('!exists', function(err, result) {
        test.ifError(err);
        test.ok(result);
        callback(err);
      })
    },
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.property('exists', function(err, result) {
        test.ifError(err);
        test.ok(result);
        callback(err);
      })
    },
  ], function(err, results) {
    test.done();
  })
}

test.create_server = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  test.equal(mineos.server_list(BASE_DIR).length, 0);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err){
        test.ifError(err);

        test.ok(fs.existsSync(instance.env.cwd));
        test.ok(fs.existsSync(instance.env.bwd));
        test.ok(fs.existsSync(instance.env.awd));
        test.ok(fs.existsSync(instance.env.sp));

        test.equal(fs.statSync(instance.env.cwd).uid, OWNER_CREDS['uid']);
        test.equal(fs.statSync(instance.env.bwd).uid, OWNER_CREDS['uid']);
        test.equal(fs.statSync(instance.env.awd).uid, OWNER_CREDS['uid']);
        test.equal(fs.statSync(instance.env.sp).uid, OWNER_CREDS['uid']);

        test.equal(fs.statSync(instance.env.cwd).gid, OWNER_CREDS['gid']);
        test.equal(fs.statSync(instance.env.bwd).gid, OWNER_CREDS['gid']);
        test.equal(fs.statSync(instance.env.awd).gid, OWNER_CREDS['gid']);
        test.equal(fs.statSync(instance.env.sp).gid, OWNER_CREDS['gid']);

        test.equal(mineos.server_list(BASE_DIR)[0], server_name);
        test.equal(mineos.server_list(BASE_DIR).length, 1);
        callback(err);
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.server_ownership = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.property('owner_uid', function(err, result) {
        test.ifError(err);
        test.equal(result, OWNER_CREDS['uid']);
        callback(err);
      })
    },
    function(callback) {
      instance.property('owner_gid', function(err, result) {
        test.ifError(err);
        test.equal(result, OWNER_CREDS['gid']);
        callback(err);
      })
    },
    function(callback) {
      instance.property('owner', function(err, result) {
        test.ifError(err);
        test.equal(result['uid'], OWNER_CREDS['uid']);
        test.equal(result['gid'], OWNER_CREDS['gid']);
        callback(err);
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.delete_server = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.property('exists', function(err, result) {
        test.ifError(err);
        test.ok(result);
        callback(err);
      })
    },
    function(callback) {
      instance.delete(function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.property('!exists', function(err, result) {
        test.ifError(err);
        test.ok(result);
        callback(err);
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.mc_instance = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  test.ok(instance.env instanceof Object);

  test.equal(instance.env.cwd, path.join(BASE_DIR, mineos.DIRS['servers'], server_name));
  test.equal(instance.env.bwd, path.join(BASE_DIR, mineos.DIRS['backup'], server_name));
  test.equal(instance.env.awd, path.join(BASE_DIR, mineos.DIRS['archive'], server_name));
  test.equal(instance.env.base_dir, BASE_DIR);
  test.equal(instance.server_name, server_name);
  test.equal(instance.env.sp, path.join(BASE_DIR, mineos.DIRS['servers'], server_name, 'server.properties'));
  test.done();
}

test.valid_server_name = function(test) {
  var regex_valid_server_name = /^(?!\.)[a-zA-Z0-9_\.]+$/;
  test.ok(mineos.valid_server_name('aaa'));
  test.ok(mineos.valid_server_name('server_1'));
  test.ok(mineos.valid_server_name('myserver'));
  test.ok(mineos.valid_server_name('1111'));
  test.ok(!mineos.valid_server_name('.aaa'));
  test.ok(!mineos.valid_server_name(''));
  test.ok(!mineos.valid_server_name('something!'));
  test.ok(!mineos.valid_server_name('#hashtag'));
  test.ok(!mineos.valid_server_name('my server'));
  test.ok(!mineos.valid_server_name('bukkit^ftb'));

  test.done();
}

test.extract_server_name = function(test) {
  test.equal(mineos.extract_server_name(BASE_DIR, '/var/games/minecraft/servers/a'), 'a');
  test.equal(mineos.extract_server_name(BASE_DIR, '/var/games/minecraft/servers/a/b'), 'a');
  test.equal(mineos.extract_server_name(BASE_DIR, '/var/games/minecraft/servers/a/b/plugins'), 'a');
  test.throws(function(){mineos.extract_server_name(BASE_DIR, '/var/games/minecraft/servers')}, 'no server name in path');
  test.throws(function(){mineos.extract_server_name(BASE_DIR, '/var/games/minecraft')}, 'no server name in path');
  test.done();
}

test.start = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.stuff('stop', function(err, proc) {
        test.ok(err); //looking for positive error
        if (err)
          callback(null);
        else
          callback(true);
      })
    },
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.start(function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          callback(null);
        })
      })
    },
    function(callback) {
      instance.property('screen_pid', function(err, pid) {
        test.ifError(err);
        test.equal(typeof(pid), 'number');
        test.ok(pid > 0);
        callback(null);
      })
    },
    function(callback) {
      instance.property('java_pid', function(err, pid) {
        test.ifError(err);
        test.equal(typeof(pid), 'number');
        test.ok(pid > 0);
        callback(null);
      })
    },
    function(callback) {
      instance.stuff('stop', function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          callback(null);
        })
      })
    },
    function(callback) {
      instance.delete(function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.property('!exists', function(err, result) {
        test.ifError(err);
        test.ok(result);
        callback(err);
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.archive = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.archive(function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          setTimeout(function() {
            test.equal(fs.readdirSync(instance.env.awd).length, 1);
            callback(null);
          }, FS_DELAY_MS)
        })
        
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.backup = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.backup(function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          setTimeout(function() {
            test.equal(fs.readdirSync(instance.env.bwd).length, 2);
            callback(null);
          }, FS_DELAY_MS)
        })
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.restore = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.backup(function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          setTimeout(function() {
            test.equal(fs.readdirSync(instance.env.bwd).length, 2);
            callback(null);
          }, FS_DELAY_MS)
        })
      })
    },
    function(callback) {
      fs.removeSync(instance.env.cwd);
      instance.property('!exists', function(err, result) {
        test.ifError(err);
        test.ok(result);
        callback(err);
      })
    },
    function(callback) {
      instance.restore('now', function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          setTimeout(function() {
            test.equal(fs.readdirSync(instance.env.cwd).length, 1);
            callback(null);
          }, FS_DELAY_MS)
        })
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.sp = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.sp(function(err, dict) {
        test.ifError(err);
        test.equal(dict['server-port'], '25565');
        callback(null);
      })
    },
    function(callback) {
      instance._sp.modify('server-port', '25570', function(err) {
        test.ifError(err);
        callback(null);
      })
    },
    function(callback) {
      instance.sp(function(err, dict) {
        test.ifError(err);
        test.equal(dict['server-port'], '25570');
        callback(null);
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.properties = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.property('exists', function(err, does_exist) {
        test.ifError(err);
        test.ok(!does_exist);
        callback(null);
      })
    },
    function(callback) {
      instance.property('java_pid', function(err, java_pid) {
        test.ok(err); //looking for positive error
        test.equal(java_pid, null);
        callback(null);
      })
    },
    function(callback) {
      instance.property('screen_pid', function(err, screen_pid) {
        test.ok(err); //looking for positive error
        test.equal(screen_pid, null);
        callback(null);
      })
    },
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.property('exists', function(err, does_exist) {
        test.ifError(err);
        test.ok(does_exist);
        callback(null);
      })
    },
    function(callback) {
      instance.property('up', function(err, up) {
        test.ifError(err);
        test.equal(up, false);
        callback(null);
      })
    },
    function(callback) {
      instance.property('server-port', function(err, port) {
        test.ifError(err);
        test.equal(port, 25565);
        callback(null);
      })
    },
    function(callback) {
      instance.property('server-ip', function(err, ip) {
        test.ifError(err);
        test.equal(ip, '0.0.0.0');
        callback(null);
      })
    },
    function(callback) {
      instance.property('memory', function(err, memory) {
        test.ok(err);
        test.equal(memory, null);
        callback(null);
      })
    },
    function(callback) {
      instance.property('ping', function(err, ping) {
        test.ok(err);
        test.equal(ping, null)
        callback(null);
      })
    },
    function(callback) {
      // SERVER BEING STARTED HERE
      instance.start(function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          setTimeout(function() {
            callback(null);
          }, 1000)
        })
      })
    },
    function(callback) {
      instance.property('java_pid', function(err, java_pid) {
        test.ifError(err);
        test.equal(typeof(java_pid), 'number');
        callback(null);
      })
    },
    function(callback) {
      instance.property('screen_pid', function(err, screen_pid) {
        test.ifError(err);
        test.equal(typeof(screen_pid), 'number');
        callback(null);
      })
    },
    function(callback) {
      instance.property('exists', function(err, does_exist) {
        test.ifError(err);
        test.ok(does_exist);
        callback(null);
      })
    },
    function(callback) {
      instance.property('up', function(err, up) {
        test.ifError(err);
        test.equal(up, true);
        callback(null);
      })
    },
    function(callback) {
      instance.property('server-port', function(err, port) {
        test.ifError(err);
        test.equal(port, 25565);
        callback(null);
      })
    },
    function(callback) {
      instance.property('server-ip', function(err, ip) {
        test.ifError(err);
        test.equal(ip, '0.0.0.0');
        callback(null);
      })
    },
    function(callback) {
      instance.property('memory', function(err, memory) {
        test.ifError(err);
        test.ok(memory);
        test.ok('VmRSS' in memory);
        callback(null);
      })
    },
    function(callback) {
      instance.kill(function(err) {
        test.ifError(err);
        setTimeout(function() { callback(err) }, 1000);
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.verify = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);
  
  async.series([
    function(callback) {
      instance.verify(['!exists', '!up'], function(result) {
        test.ok(result);
        callback(null);
      })
    },
    function(callback) {
      instance.verify(['exists'], function(result) {
        test.ok(!result);
        callback(null);
      })
    },
    function(callback) {
      instance.verify(['up'], function(result) {
        test.ok(!result);
        callback(null);
      })
    },
    function(callback) {
      instance.verify(['exists', 'up'], function(result) {
        test.ok(!result);
        callback(null);
      })
    },
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.verify(['exists', '!up'], function(result) {
        test.ok(result);
        callback(null);
      })
    },
    function(callback) {
      instance.start(function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          callback(null);
        })
      })
    },
    function(callback) {
      instance.verify(['exists', 'up'], function(result) {
        test.ok(result);
        callback(null);
      })
    },
    function(callback) {
      instance.kill(function(err) {
        test.ifError(err);
        setTimeout(function() { callback(err) }, 1000);
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.ping = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.start(function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          callback(null);
        })
      })
    },
    function(callback) {
      setTimeout(function() {
        instance.ping(function(err, pingback) {
          test.ifError(err);
          test.equal(pingback.protocol, 127);
          test.equal(pingback.server_version, '1.7.9');
          test.equal(pingback.motd, 'A Minecraft Server');
          test.equal(pingback.players_online, 0);
          test.equal(pingback.players_max, 20);
          callback(null);
        })
      }, 15000)
    },
    function(callback) {
      instance.kill(function(err) {
        test.ifError(err);
        setTimeout(function() { callback(err) }, 1000);
      })
    }
  ], function(err, results) {
    test.done();
  })
}

test.memory = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);
  var memory_regex = /(\d+) kB/

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.start(function(err, proc) {
        test.ifError(err);
        proc.once('close', function(code) {
          callback(null);
        })
      })
    },
    function(callback) {
      instance.property('memory', function(err, memory_obj) {
        test.ifError(err);
        test.equal(memory_obj.Name, 'java');
        test.ok(memory_regex.test(memory_obj.VmPeak));
        test.ok(memory_regex.test(memory_obj.VmSize));
        test.ok(memory_regex.test(memory_obj.VmRSS));
        test.ok(memory_regex.test(memory_obj.VmSwap));
        callback(null);
      })
    },
    function(callback) {
      instance.kill(function(err) {
        test.ifError(err);
        setTimeout(function() { callback(err) }, 1000);
      })
    }
  ], function(err, results) {
    test.done();
  })  
}*/

test.permission_list = function(test) {
  var server_name = 'testing';
  var instance = new mineos.mc(server_name, BASE_DIR);

  async.series([
    function(callback) {
      instance.create(OWNER_CREDS, function(err) {
        test.ifError(err);
        callback(err);
      })
    },
    function(callback) {
      instance.permission_list('mc', function(permissions) {
        test.ok('archive' in permissions);
        test.ok('view' in permissions['archive']);
        test.ok('create' in permissions['archive']);
        test.ok('restore' in permissions['archive']);
        test.ok('delete' in permissions['archive']);

        test.ok('backup' in permissions);
        test.ok('view' in permissions['backup']);
        test.ok('create' in permissions['backup']);
        test.ok('restore' in permissions['backup']);
        test.ok('delete' in permissions['backup']);

        test.ok('servers' in permissions);
        test.ok('view' in permissions['servers']);
        test.ok('delete' in permissions['servers']);

        test.ok('config' in permissions);
        test.ok('read' in permissions['config']);
        test.ok('write' in permissions['config']);

        test.ok('operation' in permissions);
        test.ok('start' in permissions['operation']);

        callback();
      })
    },
    function(callback) {
      instance.permission_list('nobody', function(permissions) {
        test.equal('archive' in permissions, false);
        test.equal('view' in permissions['archive'], false);
        test.equal('create' in permissions['archive'], false);
        test.equal('restore' in permissions['archive'], false);
        test.equal('delete' in permissions['archive'], false);

        test.equal('backup' in permissions, false);
        test.equal('view' in permissions['backup'], false);
        test.equal('create' in permissions['backup'], false);
        test.equal('restore' in permissions['backup'], false);
        test.equal('delete' in permissions['backup'], false);

        test.equal('servers' in permissions, false);
        test.equal('view' in permissions['servers'], false);
        test.equal('delete' in permissions['servers'], false);

        test.equal('config' in permissions, false);
        test.equal('read' in permissions['config'], false);
        test.equal('write' in permissions['config'], false);

        test.equal('operation' in permissions, false);
        test.equal('start' in permissions['operation'], false);

        callback();
      })
    }
  ], function(err, results) {
    test.done();
  })  
}