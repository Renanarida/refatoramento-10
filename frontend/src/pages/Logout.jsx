import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doLogout } from "../services/Auth";

export default function Logout() {
    const navigate = useNavigate();
    useEffect(() => {
        doLogout(navigate); }, [navigate])

        return <div className="p-4">Saindo</div>
}