import { useState, useEffect } from "react";
import { getAllUsers, getUsersById, updateUser, toggleActiveUser } from "../api/users";

function Users () {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");
    useEffect(() => {
        const fetchUsers = async() => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);            try {
                const result = await getAllUsers();
                setUsers(result.users);
            } catch (error) {
                let errorMessage = "";

                if (error.response) {
                    errorMessage = error.response.data?.message || "Server error occurred";
                    console.error("Backend error:", errorMessage);
                } else if (error.request) {
                    errorMessage = "No response from server";
                    console.error("Network error:", errorMessage);
                } else {
                    errorMessage = error.message;
                    console.error("Unexpected error:", errorMessage);
                }
                setError({ message: errorMessage })
            } finally {
                setLoading(false)
            }
        };
        fetchUsers();
    }, []);


        const fetchUserById = async() => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);
            try {
                const result = await getUsersById(userId);
                setSelectedUser(result.cleanUser);
            } catch (error) {
                let errorMessage = "";

                if (error.response) {
                    errorMessage = error.response.data?.message || error.response.data?.error || "Server error occurred";
                    console.error("Backend error:", errorMessage);
                } else if (error.request) {
                    errorMessage = "No response from server";
                    console.error("Network error:", errorMessage);
                } else {
                    errorMessage = error.message;
                    console.error("Unexpected error:", errorMessage);
                }
                setError({ message: errorMessage })
            } finally {
                setLoading(false)
            }
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleString();
        }

    const [editUser, setEditUser] = useState({
        id: "",
        username: "",
        email: "",
        role: "",
        gender: ""
    });
    
    const [isEditing, setIsEditing] = useState(false);
    
    const updateUserById = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);        
        console.log("Updating user with ID:", editUser.id);
        try{
            console.log("editUser before update:", editUser);

            const result = await updateUser(editUser.id,{
                username: editUser.username,
                email: editUser.email,
                role: editUser.role,
                gender: editUser.gender
            });
            setEditUser({
                id: selectedUser.id || "",
                username: selectedUser.username || "",
                email: selectedUser.email || "",
                role: selectedUser.role?.role_name || "",
                gender: selectedUser.gender || ""            
            });
            console.log("User info updated successfully");
            } catch (error) {
                let errorMessage = "";

                if (error.response) {
                    errorMessage = error.response.data?.message || "Server error occurred";
                    console.error("Backend error:", errorMessage);
                } else if (error.request) {
                    errorMessage = "No response from server";
                    console.error("Network error:", errorMessage);
                } else {
                    errorMessage = error.message;
                    console.error("Unexpected error:", errorMessage);
                }
                setError({ message: errorMessage })
            } finally {
                setLoading(false)
            }
        };

    const handleToggleActive = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);

        const newStatus = !selectedUser.active
        try {
            const result = await toggleActiveUser(selectedUser.id, !selectedUser.active);

            setSelectedUser(prev => ({ ...prev, active: !prev.active }));

            if (newStatus) {
                setSuccessMessage("User activated successfully");
            } else {
                setSuccessMessage("User deactivated successfully");
            }
            console.log("User active status toggled successfully");
            } catch (error) {
                let errorMessage = "";

                if (error.response) {
                    errorMessage = error.response.data?.message || "Server error occurred";
                    console.error("Backend error:", errorMessage);
                } else if (error.request) {
                    errorMessage = "No response from server";
                    console.error("Network error:", errorMessage);
                } else {
                    errorMessage = error.message;
                    console.error("Unexpected error:", errorMessage);
                }
                setError({ message: errorMessage })
            } finally {
                setLoading(false)
            }
    }


        if(loading) return<p>Loading users.</p>
        if(error) return<p>Error: {error.message}</p>


    return (
        <div>
            <h2>User List</h2>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Username</th>
                     </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id}>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.id}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.username}</td>
                       </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: "2rem" }}>
                <h3>Search User by ID</h3>

                <input 
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                />

                <button onClick={fetchUserById}>Search</button>

                {selectedUser && (
                    <div>
                        <p>Id: {selectedUser.id}</p>
                        <p>Username: {selectedUser.username}</p>
                        <p>Email: {selectedUser.email}</p>
                        <p>Role: {selectedUser.role?.role_name}</p>
                        <p>Gender: {selectedUser.gender}</p>
                        <p>Active: {selectedUser.active ? "Active" : "Inactive"}</p>
                        <p>Created at: {formatDate(selectedUser.created_at)}</p>      
                

                        <button onClick={() => {
                            setEditUser(selectedUser);
                            setIsEditing(true);
                        }}
                        >
                            Edit
                        </button>
                {isEditing && (
                    <div style={{ marginTop: "1rem" }}>
                        <h4>Edit User</h4>
                        <p>Username</p>
                        <input
                        placeholder="Enter username"
                        value={editUser.username}
                        onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                        />
                        <p>Email</p>
                        <input
                        placeholder="Enter email"
                        value={editUser.email}
                        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        />
                        <p>Role</p>
                        <input
                        placeholder="Enter role"
                        value={editUser.role?.role_name || ""}
                        onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                        />
                        <p>Gender</p>
                        <input
                        placeholder="Enter gender"
                        value={editUser.gender}
                        onChange={(e) => setEditUser({ ...editUser, gender: e.target.value })}
                        />
                        <button onClick={updateUserById}>Update</button>

                        <button onClick={handleToggleActive}>Toggle Active</button>
                        {successMessage && <p>{successMessage}</p>}


                    </div>
                    )}
                </div>
)}
            </div>
        </div>
    )  
}

export default Users;