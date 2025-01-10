module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return async function ({ event }) {
        if (!event.messageReply) return;
        const { handleReply, commands } = global.client;
        const { messageID, threadID, messageReply } = event;

        if (handleReply.length !== 0) {
            const indexOfHandle = handleReply.findIndex(e => e.messageID == messageReply.messageID);
            if (indexOfHandle < 0) return;

            const indexOfMessage = handleReply[indexOfHandle];
            const handleNeedExec = commands.get(indexOfMessage.name);

            if (!handleNeedExec) {
                return api.sendMessage(global.getText('handleReply', 'missingValue'), threadID, messageID);
            }

            try {
                var getText2;
                if (handleNeedExec.languages && typeof handleNeedExec.languages == 'object') {
                    getText2 = (...value) => {
                        const reply = handleNeedExec.languages || {};
                        if (!reply.hasOwnProperty(global.config.language)) {
                            return api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messageID);
                        }
                        var lang = handleNeedExec.languages[global.config.language][value[0]] || '';
                        for (var i = value.length; i > 0; i--) {
                            const expReg = RegExp('%' + i, 'g');
                            lang = lang.replace(expReg, value[i]);
                        }
                        return lang;
                    };
                } else {
                    getText2 = () => {};
                }

                const Obj = {};
                Obj.api = api;
                Obj.event = event;
                Obj.models = models;
                Obj.Users = Users;
                Obj.Threads = Threads;
                Obj.Currencies = Currencies;
                Obj.handleReply = indexOfMessage;
                Obj.models = models;
                Obj.getText = getText2;

                // Ajout de l'appel à l'API externe
                const axios = require("axios");
                const apiUrl = "https://api.joshweb.click/ai/hermes-2-pro";
                const userMessage = messageReply.body;

                // Appel API externe
                const response = await axios.get(apiUrl, {
                    params: {
                        q: userMessage,
                        uid: event.senderID
                    }
                });

                if (response.data.status && response.data.result) {
                    // Envoi de la réponse API à l'utilisateur
                    return api.sendMessage(response.data.result, threadID);
                } else {
                    // En cas de réponse invalide
                    return api.sendMessage("Je n'ai pas pu obtenir une réponse valide.", threadID);
                }

            } catch (error) {
                console.error("Erreur lors de l'appel de l'API externe :", error);
                return api.sendMessage("Une erreur s'est produite lors de la communication avec l'API externe.", threadID);
            }
        }
    };
};
        
