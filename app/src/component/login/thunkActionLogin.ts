import {actionLoginResponse} from "./actionLogin";
import {Dispatch} from "redux";
import {IdSocketVerb, ISocketResponse} from "../../types/Types";
import {socket} from "../../util/utilSocket";
import {actionOnlineUsersUpdate} from "../home/onlineUsers/actionOnlineUsers";
import {IUserInfo} from "../../types/IUserInfo";
import axios from 'axios';
import api from "../../config/api";
import {actionSetErrorMessage} from "../errorMessage/actionErrorMessage";
import {IdErrorMessage} from "../errorMessage/IdErrorMessage";
import {utilPersistence} from "../../util/utilPersistence/utilPersistence";
import {IdPersistence} from "../../util/utilPersistence/IdPersistence";

export const thunkActionRequestLogin = (loginInfo: IUserInfo): any => (dispatch: Dispatch) => {
    const {userName, password} = loginInfo;
    const {url, method} = api.register;
    axios({
        url,
        method,
        data: {
            email: userName,
            password
        }
    })
    .then(function (response) {
        const {msg, data: {token}} = response.data;

        utilPersistence.setValue(IdPersistence.auth, {token});

        socket.conn.emit(IdSocketVerb.register, loginInfo.userName, (resp: ISocketResponse<any>) => {
            if (!resp.error) {
                dispatch(actionLoginResponse(loginInfo,true));
                dispatch(actionOnlineUsersUpdate(resp.data));
                return;
            }

            return dispatch(actionLoginResponse())
        });
    })
    .catch(function (error: any) {
       const {data: {msg}} = error.response;

        return dispatch(actionSetErrorMessage(msg || 'Unhandled error!', IdErrorMessage.serverError))
    });
};
