export default class PeerService {
  private peer : RTCPeerConnection;
  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }

  async getAnswer(offer : RTCSessionDescriptionInit | undefined ){
    if(this.peer && offer){
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans))
      return ans;
    }
  };


  async setLocalDescription(ans : RTCSessionDescription | undefined){
      if(this.peer && ans){
        console.log("ans : ", ans);
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
      }
  }


  async getOffer(){
    if(this.peer){
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  getPeer(){
    return this.peer;
  }

}