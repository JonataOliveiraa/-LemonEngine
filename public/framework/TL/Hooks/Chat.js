import { Terraria } from './../ModImports.js';
import { CombinedLoader } from './../Loaders/CombinedLoader.js';

export class ChatHooks {
    static initialized = false;
    
    static HookList = {
        ProcessIncomingMessage: true
    };
    
    static Initialize() {
        if (this.initialized) return;
        
        if (this.HookList.ProcessIncomingMessage) {
            Terraria.Chat.ChatCommandProcessor['void ProcessIncomingMessage(ChatMessage message, int clientId)']
            .hook((original, self, message, client_id) => {
                if (CombinedLoader.SendMessage(Terraria.Main.player[Terraria.Main.myPlayer], message.Text)) {
                    original(self, message, client_id);
                }
            });
        }
        
        this.initialized = true;
    }
}