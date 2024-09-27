class PeerService{

    private _peer !: RTCPeerConnection;

    constructor(){
        if(!this.peer){
            this._peer = new RTCPeerConnection({
                iceServers:[{
                    urls: ["stun:stun.l.google.com:19302" , "stun:stun1.l.google.com:3478"]
                }]
            });
        }
    }

    public get peer () : RTCPeerConnection{
        return this._peer;
    }

    async getAnswer(offer : RTCSessionDescriptionInit)  :  Promise<RTCSessionDescriptionInit | null>{

        if(!this.peer){
            console.log("no peer");
            return null;
        }

        await this.peer.setRemoteDescription(offer);
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(ans));
        return ans;
    }

    async setLocalDescription(ans : RTCSessionDescriptionInit) {
        if (this.peer) {
          await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
      }


    async getOffer() : Promise<RTCSessionDescriptionInit | null> {

        if(!this.peer){
            console.log("no peer");
            return null;
        }

        const offer =  await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    }
}

export default new PeerService();
