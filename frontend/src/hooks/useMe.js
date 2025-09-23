import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../services/api";

export default function useMe() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const {data} = await api.get("/me");
                if (mounted) setMe(data);
            } catch (e) {
                if (mounted) setError(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {mounted = false;};
    }, []);
    return {me, loading, error};
}