import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/header";
import duckhang from "../../images/duckhang.png";
import "./profile.css";

export default function ProfilePage() {

    const [nickname, setNickname] = useState("");
    const [scope, setScope] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            const url = new URL(window.location.href);
            const pathSegments = url.pathname.split('/');
            const uuid = pathSegments[2];
            console.log(uuid)
            try {
                const response = await axios.get(`http://localhost:8080/user/${uuid}`, {
                    withCredentials: true,
                });

                console.log(response.data.nickname, response.data.scope)
                setNickname(response.data.nickname);
                setScope(response.data.scope);
            } catch (error) {
                console.error("사용자 정보 요청 중 오류 발생:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <>
            <Header />
            <div className="profile-wrap">
                <div className="profile-image">
                    <img src={duckhang} alt="프로필 이미지" />
                </div>
                <div className="user-info">
                    <div className="nickname">{nickname}</div>
                    <div className="scope">{scope}</div>
                </div>
            </div>
        </>
    ); 
}
