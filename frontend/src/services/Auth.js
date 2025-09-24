import API from "./api";

export async function doLogout(navigate) {
    try {
        await API.post("/logout");
    } catch (e) {
        // console.error("Erro no Logout:", err);
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (navigate) navigate("/login", {replace: true});
    }
}