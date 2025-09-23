import useMe from "../hooks/useMe";
import UserChip from "./UserChip";

export default function Topbar() {
  const { me, setMe } = useMe();

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: 12 }}>
      <UserChip me={me} onUpdated={setMe} />
    </div>
  );
}