

export const notifyFormatter = (type: string,data: any) => {

    switch (type) {

    case "COLLAB_REQUEST":
        return {
            "type": "topic.collab.request",
            "payload": {
                "notiType": "default",
                "actionSource": "topic",
                "actionType": "collab-request",
                "from": data?.fromUsername,
                "to": data?.toUsername,
                "topicId": data?.topicId,
                "topicName": data?.topicName,
                "fromUserId": data?.fromUserId,
                "toUserId": data?.toUserId
            }
        }


    case "COLLAB_ACCEPT":
        return {
            "type": "topic.collab.accept",
            "payload": {
                "notiType": "default",
                "actionSource": "topic",
                "actionType": "collab-accept",
                "from": data?.toUsername,
                "to": data?.fromUsername,
                "topicId": data?.topicId,
                "topicName": data?.topicName,
                "notifyId": data?.notifyId,
                "fromUserId": data?.toUserId,
                "toUserId": data?.fromUserId
            }
        }


    case "COLLAB_DECLINE":
        return {
            "type": "topic.collab.decline",
            "payload": {
                "notiType": "default",
                "actionSource": "topic",
                "actionType": "collab-decline",
                "from": data?.toUsername,
                "to": data?.fromUsername,
                "topicId": data?.topicId,
                "topicName": data?.topicName,
                "notifyId": data?.notifyId,
                "fromUserId": data?.toUserId,
                "toUserId": data?.fromUserId
            }
        }


    case "SUGGEST_PROBLEM":
        return {
            "type": "topic.suggestion.author",
            "payload": {
                "notiType": "default",
                "actionSource": "topic",
                "actionType": "suggestion",
                "from": data?.fromUsername,
                "to": data?.toUsername,
                "topicId": data?.topicId,
                "topicName": data?.topicName,
                "problemUrl": data?.problemUrl,
                "problemName": data?.problemName
            }
        }


    case "USER_SIGNUP_SUCCESSFUL":
        return {
            "type": "user.signup.successful",
            "payload": {
                "notiType": "email",
                "actionSource": "normal",
                "actionType": "signup-successful",
                "from": "admin",
                "to": data?.toUsername,
                "toEmail": data?.toEmail,
                "toUserId": data?.toUserId
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