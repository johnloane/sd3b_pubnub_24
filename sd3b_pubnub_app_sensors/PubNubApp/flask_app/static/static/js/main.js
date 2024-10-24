let aliveSecond = 0;
let heartBeatRate = 1000;
let pubnub;
let appChannel = "johns-pi-channel";

function time()
{
    let d = new Date();
    let currentSecond = d.getTime();
    if(currentSecond - aliveSecond > heartBeatRate + 1000)
    {
        document.getElementById("connection_id").innerHTML="DEAD";
    }
    else
    {
        document.getElementById("connection_id").innerHTML="ALIVE";
    }
    setTimeout('time()', 1000);
}

function keepAlive()
{
    fetch('/keep_alive')
    .then(response=>{
        if(response.ok){
            let date = new Date();
            aliveSecond = date.getTime();
	    return response.json();
        }
        throw new Error('Server offline');
    })
    .catch(error=>console.log(error));
    setTimeout('keepAlive()', heartBeatRate);
}

function handleClick(cb)
{
    if(cb.checked)
    {
        value="on";
    }
    else
    {
        value = "off";
    }
    publishMessage({"buzzer":value});
}

const setupPubNub = () => {
    pubnub = new PubNub({
        publishKey: 'pub-c-6ce775ac-3b15-47e0-937b-e5bd7cf6c79d',
        subscribeKey: 'sub-c-6eb23377-44fd-4c6e-b456-974c422b6cc7',
        userId: 'Johns_Web_App',
    });
    //create a local channel
    const channel = pubnub.channel(appChannel);
    //create a subscription on the channel
    const subscription = channel.subscription();
    //add listener
    pubnub.addListener({
        status: (s) =>{
            console.log("Status", s.category);
        },
    });

    //add an onMessage listener on the channel
    subscription.onMessage = (messageEvent) => {
        handleMessage(messageEvent.message);
    };
    //subscribe to the channel
    subscription.subscribe();
};

function handleMessage(message)
{
    if(message == '"Motion":"Yes"')
    {
        document.getElementById("motion_id").innerHTML = "Yes";
    }
    if(message == '"Motion":"No"')
    {
        document.getElementById("motion_id").innerHTML = "No";
    }
}

const publishMessage = async(message) => {
    const publishPayload = {
        channel: appChannel,
        message: {
            message:message
        },
    };
    await pubnub.publish(publishPayload);
}
