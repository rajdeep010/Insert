

const notifyFormatter = (type: string,data: any) => {

    switch (type) {

    case "COLLAB_REQUEST":
        return {
            "type": "topic.collab.request",
            "payload": {
                "notiType": "default",
                "actionSource": "topic",
                "actionType": "collab-request",
                "from": data.fromUsername,
                "to": data.toUsername,
                "topicId": data.topicId,
                "topicName": data.topicName,
            }
        }


    case "COLLAB_ACCEPT":
        return {
            "type": "topic.collab.accept",
            "payload": {
                "notiType": "default",
                "actionSource": "topic",
                "actionType": "collab-accept",
                "from": data.fromUsername,
                "to": data.toUsername,
                "topicId": data.topicId,
                "topicName": data.topicName,
            }
        }


    case "COLLAB_DECLINE":
        return {
            "type": "topic.collab.decline",
            "payload": {
                "notiType": "default",
                "actionSource": "topic",
                "actionType": "collab-decline",
                "from": data.fromUsername,
                "to": data.toUsername,
                "topicId": data.topicId,
                "topicName": data.topicName,
            }
        }


    case "SUGGEST_PROBLEM":
        return {
            "type": "topic.suggestion.author",
            "payload": {
                "notiType": "default",
                "actionSource": "topic",
                "actionType": "suggestion",
                "from": data.fromUsername,
                "to": data.toUsername,
                "topicId": data.topicId,
                "topicName": data.topicName,
                "problemUrl": data.problemUrl,
                "problemName": data.problemName
            }
        }


    case "USER_SIGNUP_SUCCESSFUL":
        return {
            "type": "user.signup.successful",
            "payload": {
                "noti_type": "signup",
                "from": "admin",
                "to": data.toUsername,
                "toEmail": data.toEmail
            }
        }


    default:
        return {
            "type": "",
            "payload": {
                "noti_type": "",
                "from": "admin",
                "to": "",
            }
        }
    }
}