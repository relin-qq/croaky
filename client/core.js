var isFirefox = !!navigator.mozGetUserMedia;

angular.module('voiceApp', ['ngSanitize'])
.controller('VoiceController', function($scope) {
    var voiceCtrl = this;
    window.voiceCtrl = voiceCtrl;
    voiceCtrl.croakyUrl = "https://croaky.epow0.org/";
    voiceCtrl.audioButtonText = "Mute Audio";
    voiceCtrl.videoButtonText = "Mute Video";
    voiceCtrl.videoRoomListeners = {};

    voiceCtrl.primus = new Primus(voiceCtrl.croakyUrl);

    voiceCtrl.primus.on('data', function message(data) {
          console.log('Received a new message from the server', data);
    });

    voiceCtrl.login = function() {
    };

    Janus.init({debug: "all", callback: function() {
        if(!Janus.isWebrtcSupported()) {
            console.log("No WebRTC support...");
            return;
        }
        voiceCtrl.janus = new Janus({
            server: "wss://voice.epow0.org:8188/",
            success: function() {
                voiceCtrl.janus.attach({
                    plugin: "janus.plugin.videoroom",
                    success: function(pluginHandle) {
                        voiceCtrl.videoRoomHandle = pluginHandle;
                        voiceCtrl.logChat("Attached to videoroom!");
                    },
                    error: function(error) {
                    },
                    consentDialog: function(on) {
                    },
                    onmessage: function(msg, jsep) {
                        console.log("MSG (JSEP:"+jsep+") ",msg);
                        var event = msg["videoroom"];
                        switch(event) {
                            case "joined":
                                voiceCtrl.handleJoinEvent(msg,jsep);
                                break;
                            case "event":
                                voiceCtrl.handleEventEvent(msg,jsep);
                                break;
                            default:
                                console.log("Unknown event: ",msg,"JSEP: ",jsep);
                        }
                    },
                    onlocalstream: function(stream) {
                        voiceCtrl.logChat("Found a local stream!");
                        voiceCtrl.localStream = stream;
                        var video = document.getElementById('me');
                        video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.URL.createObjectURL(stream);
                        voiceCtrl.audioButtonText = "Mute Audio";
                        var max_level_L = 0;
                        var old_level_L = 0;
                        var cnvs = document.getElementById("test");
                        var cnvs_cntxt = cnvs.getContext("2d");

                        /*window.AudioContext = window.AudioContext || window.webkitAudioContext;
                        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;*/

                        var audioContext = new AudioContext();

                        var microphone = audioContext.createMediaStreamSource(stream);
                        voiceCtrl.voiceActivationNode = audioContext.createScriptProcessor(1024, 1, 1);

                        microphone.connect(voiceCtrl.voiceActivationNode);
                        voiceCtrl.voiceActivationNode.connect(audioContext.destination);
                        voiceCtrl.voiceActivationNode.onaudioprocess = function(event){
                            var inpt_L = event.inputBuffer.getChannelData(0);
                            var instant_L = 0.0;

                            var sum_L = 0.0;
                            for(var i = 0; i < inpt_L.length; ++i) {
                                sum_L += inpt_L[i] * inpt_L[i];
                            }
                            instant_L = Math.sqrt(sum_L / inpt_L.length);
                            max_level_L = Math.max(max_level_L, instant_L);
                            instant_L = Math.max( instant_L, old_level_L -0.008 );
                            old_level_L = instant_L;

                            cnvs_cntxt.clearRect(0, 0, cnvs.width, cnvs.height);
                            cnvs_cntxt.fillStyle = '#00ff00';
                            cnvs_cntxt.fillRect(10,10,(cnvs.width-20)*(instant_L/max_level_L),(cnvs.height-20)); // x,y,w,h
                        },function(e){ console.log(e); };
                    },
                    onremotestream: function(stream) {
                    },
                    oncleanup: function() {
                    }
                });
                voiceCtrl.logChat("Janus init success!");
                voiceCtrl.janus.attach({
                    plugin: "voice.plugin.broadcast",
                    success: function(pluginHandle) {
                        console.log("BAWKPLUG: Attach successful!");
                        voiceCtrl.broadcastHandle = pluginHandle;
                    },
                    error: function(err) {
                        console.log("BAWKPLUG: Attach error: ",err);
                    },
                    consentDialog: function(on) {
                    },
                    onmessage: function(msg, jsep) {
                        console.log("BAWKPLUG: Received message: ",msg," jsep: ",jsep);
                    },
                    onlocalstream: function(stream) {
                    },
                    onremotestream: function(stream) {
                    },
                    oncleanup: function() {
                    }
                });
            },
            error: function() {
                console.log("Janus ERROR");
            },
            destroyed: function() {
                console.log("Janus DESTROYED");
            }
        });
        voiceCtrl.logChat("Started janus init...");
    }});


    voiceCtrl.bawkplugDebug = function() {
        voiceCtrl.broadcastHandle.send({"message": JSON.parse(voiceCtrl.bawkplugdebug)});
    };

    voiceCtrl.handleEventEvent = function(msg,jsep) {
        console.log("EventEvent! msg: ",msg," jsep: ",jsep);
        if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
            voiceCtrl.logChat("New publishers detected!");
            var list = msg["publishers"];
            for(var i=0;i<list.length;++i) {
                var pub = list[i];
                voiceCtrl.onNewRemoteStream(pub);
            }
        } else if(msg["leaving"] !== undefined && msg["leaving"] !== null) {
            var leaver = msg["leaving"];
            voiceCtrl.logChat("Someone left voice... "+leaver.display+"("+leaver.id+")");
            $("#stream"+leaver).remove();
            if(voiceCtrl.videoRoomListeners[leaver] != null) {
                voiceCtrl.videoRoomListeners[leaver].detach();
                delete voiceCtrl.videoRoomListeners[leaver];
            }
        } else if(msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
            var leaver = msg["unpublished"];
            voiceCtrl.logChat("Someone unpublished stream... "+leaver.display+"("+leaver.id+")");
            $("#stream"+leaver).remove();
            if(voiceCtrl.videoRoomListeners[leaver] != null) {
                voiceCtrl.videoRoomListeners[leaver].detach();
                delete voiceCtrl.videoRoomListeners[leaver];
            }
        }
        if(jsep !== undefined && jsep !== null) {
			console.log("Handling remote SDP...",jsep);
			voiceCtrl.videoRoomHandle.handleRemoteJsep({jsep: jsep});
		}
    };

    voiceCtrl.onNewRemoteStream = function(pub) {
        console.log("There is a new publisher: ",pub);
        voiceCtrl.janus.attach({
            plugin: "janus.plugin.videoroom",
            success: function(pluginHandle) {
                voiceCtrl.videoRoomListeners[pub.id] = pluginHandle;
                var listen = { "request": "join", "room": 1234, "ptype": "listener", "feed": pub.id };
                voiceCtrl.videoRoomListeners[pub.id].send({"message": listen});
            },
            error: function(error) {
                console.log("Error while binding listener: ",error);
            },
            onmessage: function(msg, jsep) {
                console.log("Got a message for listener "+pub.id+": msg: ",msg," jsep: ",jsep);
                var event = msg["videoroom"];
                if(event != undefined && event != null) {
                    if(event === "attached") {
                        voiceCtrl.logChat("Attached to a new publisher!");
                    }
                }
                if(jsep !== undefined && jsep !== null) {
                    voiceCtrl.videoRoomListeners[pub.id].createAnswer({
                        jsep: jsep,
                        media: { audioSend: false, videoSend: false },
                        success: function(jsep) {
                            var body = { "request": "start", "room": 1234 };
                            voiceCtrl.videoRoomListeners[pub.id].send({"message": body, "jsep": jsep});
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });
                }
            },
            onlocalstream: function(stream) {
                // The subscriber stream is recvonly, we don't expect anything here
            },
            onremotestream: function(stream) {
                voiceCtrl.logChat("Remote stream for listener "+pub.display+"("+pub.id+")");
                console.log("Got a remote stream for listener "+pub.id+": stream: ",stream);
                var vid = $("<video>");
                vid[0].autoplay = true;
                vid[0].controls = "controls";
                vid[0].id = "stream"+pub.id;
                attachMediaStream(vid[0],stream);
                vid.appendTo("#videos");
            },
            oncleanup: function() {
            }
        });
    };

    voiceCtrl.handleJoinEvent = function(msg,jsep) {
        console.log("JoinEvent!");
        voiceCtrl.publishOwnStream();
        if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
            var list = msg["publishers"];
            console.log("Found publisher list: ",list);
            for(var i=0;i<list.length;++i) {
                voiceCtrl.onNewRemoteStream(list[i]);
            }
        }
    };

    voiceCtrl.registerSession = function() {
        var register = { "request": "join", "room": 1234, "ptype": "publisher", "display": voiceCtrl.chosenusername };
        voiceCtrl.videoRoomHandle.send({"message": register});
    };

    voiceCtrl.publishOwnStream = function() {
        voiceCtrl.videoRoomHandle.createOffer({
            media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true}, // Publishers are sendonly
            success: function(jsep) {
				console.log("Got publisher SDP!",jsep);
				var publish = { "request": "configure", "audio": true, "video": true };
				voiceCtrl.videoRoomHandle.send({"message": publish, "jsep": jsep});
			},
            error: function(err) {
                console.log("Error while trying to publish: ",err);
            }
        });
    };

    voiceCtrl.toggleLocalAudio = function() {
        voiceCtrl.localStream.getAudioTracks()[0].enabled = !voiceCtrl.localStream.getAudioTracks()[0].enabled;
        if(voiceCtrl.localStream.getAudioTracks()[0].enabled) {
            voiceCtrl.audioButtonText = "Mute Audio";
        } else {
            voiceCtrl.audioButtonText = "Unmute Audio";
        }
    };
    
    voiceCtrl.toggleLocalVideo = function() {
        voiceCtrl.localStream.getVideoTracks()[0].enabled = !voiceCtrl.localStream.getVideoTracks()[0].enabled;
        if(voiceCtrl.localStream.getVideoTracks()[0].enabled) {
            voiceCtrl.videoButtonText = "Mute Video";
        } else {
            voiceCtrl.videoButtonText = "Unmute Video";
        }
    };

    voiceCtrl.logChat = function(msg) {
        $("#chatlines").append("["+new Date().toISOString()+"] "+msg+"<br />\n");
    };

    angular.element(document).ready(function() {
        //voiceCtrl.startVideo();
        var scrollDown = function(event) {
            event.target.scrollTop = event.target.scrollHeight;
        };
        document.getElementById("chatlines").addEventListener("DOMSubtreeModified",scrollDown);
    });

    $scope.$on("$destroy", function(){
        //On unload
    });
});


