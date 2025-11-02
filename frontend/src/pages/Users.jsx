import { useState, useEffect } from "react";

function Users () {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:3000/users");
                const result = await response.json();
                setUsers(result.users);
            } catch (error) {
                console.log("Error fetching data:", error);
                setError(error)
            } finally {
                setLoading(false)
            }
        };
        fetchUsers();
    }, []);

        if(loading) return<p>Loading users.</p>
        if(error) return<p>Error: {error.message}</p>

   
    return (
        <div>
            <h2>User List</h2>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>id</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>email</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>username</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>role_id</th> 
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>gender</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>active</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id}>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.id}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.email}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.username}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.role_id}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.gender}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.active ? "Active" : "Inactive"}</td>
                       </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Users;