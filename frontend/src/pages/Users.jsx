import { useState, useEffect } from "react";
import { createUser, getAllUsers, getUsersById, updateUser, toggleActiveUser, getAllAvailableRole } from "../api/users";

function Users() {

    // ============================
    //  STATE GROUPING
    // ============================
    // Data
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // Handleadd users

    const [addUsers, setAddUsers] = useState({
        id: "",
        email: "",
        username: "",
        password: "",
        role_id: "",
        gender: "",
    });

    const resetForm = () => {
        setAddUsers({
            id: "",
            email: "",
            username: "",            
            password: "",
            role_id: "",
            gender: "",           
        });
    }

    // Dropdown Role 

    const [ selectedRole, setSelectedRole ] = useState("");
    const [ availableRole, setAvailableRole ] = useState([]);

    // Editing
    const [editUser, setEditUser] = useState({
        id: "",
        username: "",
        email: "",
        role: "",
        gender: ""
    });
    const [isEditing, setIsEditing] = useState(false);

    // Inputs
    const [userId, setUserId] = useState("");

    // UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");


    // ============================
    //  FETCH ALL USERS ON LOAD
    // ============================
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setSuccessMessage("");
            setError(null);

            try {
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

                setError({ message: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // ============================
    //  Fetch Available Roles
    // ============================

    useEffect(() => {
        const fetchAvaiableRoles = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/users/available"
                );
                const data = await response.json();
                setAvailableRole(data.role);
            } catch (error) {
                let errorMessage = "";

                if (error.response) {
                errorMessage =
                    error.response.data?.message || "Server error occurred";
                console.error("Backend error:", errorMessage);
                } else if (error.request) {
                errorMessage = "No response from server";
                console.error("Network error:", errorMessage);
                } else {
                errorMessage = error.message;
                console.error("Unexpected error:", errorMessage);
                }

                setError({ message: errorMessage });
            } finally {
                setLoading(false);
            }
            };

            fetchAvaiableRoles();
        }, []);

    // ============================
    //  HANDLE ADD USER
    // ============================

    const handleAddUsers = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        setError(null);

        try {

            const payload = {
                ...addUsers,
                role_id: selectedRole
            };
            console.log("Sending to backend...");

            console.log("Final payload being sent:", payload);
            
            const result = await createUser(payload);
            console.log("Finished API callm proceeding...");
            resetForm();

            setSuccessMessage("Staff added successfully!");
            console.log("User create:", result);
    } catch (error) {
      let errorMessage = "";

      if (error.response) {
        errorMessage =
          error.response.data?.message || "Server error occurred";
        console.error("Backend error:", errorMessage);
      } else if (error.request) {
        errorMessage = "No response from server";
        console.error("Network error:", errorMessage);
      } else {
        errorMessage = error.message;
        console.error("Unexpected error:", errorMessage);
      }

      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };


    // ============================
    //  FETCH USER BY ID
    // ============================
    const fetchUserById = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);

        try {
            const result = await getUsersById(userId);
            setSelectedUser(result.user);

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

            setError({ message: errorMessage });
        } finally {
            setLoading(false);
        }
    };


    // ============================
    //  UPDATE USER
    // ============================
    const updateUserById = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);

        try {
            const result = await updateUser(editUser.id, {
                username: editUser.username,
                email: editUser.email,
                role: editUser.role,
                gender: editUser.gender
            });

            // Reset editUser back to selectedUser values
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

            setError({ message: errorMessage });
        } finally {
            setLoading(false);
        }
    };


    // ============================
    //  TOGGLE ACTIVE
    // ============================
    const handleToggleActive = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);

        const newStatus = !selectedUser.active;

        try {
            await toggleActiveUser(selectedUser.id, newStatus);

            setSelectedUser((prev) => ({ ...prev, active: newStatus }));

            setSuccessMessage(
                newStatus ? "User activated successfully" : "User deactivated successfully"
            );

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

            setError({ message: errorMessage });

        } finally {
            setLoading(false);
        }
    };


    // ============================
    //  HELPERS
    // ============================
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };


    // ============================
    //  RENDERING
    // ============================
    if (loading) return <p>Loading users...</p>;
    if (error) return <p>Error: {error.message}</p>;


    return (
        <div>

            {/* =======================
                USERS TABLE
            ======================= */}
            <h2>User List</h2>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Username</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.id}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.username}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* =======================
                CREATE USERS
            ======================= */}

            <div style={{ marginTop: "2rem" }}>
                <h2>Create User</h2>
                <form onSubmit={handleAddUsers}>
                    <p>E-mail</p>
                    <input
                    type="text"
                    placeholder="Enter Email Address"
                    value={addUsers.email}
                    onChange={(e) =>
                        setAddUsers({ ...addUsers, email: e.target.value })
                    }
                    />
                    <p>Username</p>
                    <input
                    type="text"
                    placeholder="Enter Username"
                    value={addUsers.username}
                    onChange={(e) =>
                        setAddUsers({ ...addUsers, username: e.target.value })
                    }
                    />
                    <p>Password</p>
                    <input
                    type="password"
                    placeholder="Enter Password"
                    value={addUsers.password}
                    onChange={(e) =>
                        setAddUsers({ ...addUsers, password: e.target.value })
                    }
                    />
                    <p>Gender</p>
                    <label>
                    <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={addUsers.gender === "male"}
                    onChange={(e) =>
                        setAddUsers({ ...addUsers, gender: e.target.value})
                    }
                    />
                    Male
                    </label>
                    <label>
                    <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={addUsers.gender === "female"}
                    onChange={(e) =>
                        setAddUsers({ ...addUsers, gender: e.target.value})
                    }
                    />
                    Female
                    </label>
                    <p>Role</p>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <option value="">--Select a Role--</option>
                        {availableRole.map((role) => (
                            <option key={role.role_id} value={role.role_id}>
                                {role.role_name} ({role.description})
                            </option>
                        ))}
                    </select>

                    <button type="submit">Submit</button>
                    {successMessage && <p>{successMessage}</p>}
                </form>
            </div>

            {/* =======================
                SEARCH BY ID
            ======================= */}
            <div style={{ marginTop: "2rem" }}>
                <h3>Search User by ID</h3>

                <input
                    placeholder="Enter user ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />

                <button onClick={fetchUserById}>Search</button>


                {/* =======================
                    SELECTED USER DETAILS
                ======================= */}
                {selectedUser && (
                    <div style={{ marginTop: "1rem" }}>
                        <p>Id: {selectedUser.id}</p>
                        <p>Username: {selectedUser.username}</p>
                        <p>Email: {selectedUser.email}</p>
                        <p>Role: {selectedUser.role?.role_name}</p>
                        <p>Gender: {selectedUser.gender}</p>
                        <p>Active: {selectedUser.active ? "Active" : "Inactive"}</p>
                        <p>Created at: {formatDate(selectedUser.created_at)}</p>

                        <button
                            onClick={() => {
                                setEditUser(selectedUser);
                                setIsEditing(true);
                            }}
                        >
                            Edit
                        </button>


                        {/* =======================
                            EDIT USER FORM
                        ======================= */}
                        {isEditing && (
                            <div style={{ marginTop: "1rem" }}>
                                <h4>Edit User</h4>

                                <p>Username</p>
                                <input
                                    type="text"
                                    value={editUser.username}
                                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                                />

                                <p>Email</p>
                                <input
                                    type="text"
                                    value={editUser.email}
                                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                />

                                <p>Role</p>
                                <select
                                    value={editUser.role_id}
                                    onChange={(e) =>  
                                        setEditUser({ ...editUser, role_id: e.target.value})
                                    }
                                >
                                    <option value="">--Select a Role--</option>
                                    {availableRole.map((role) => (
                                        <option key={role.role_id} value={role.role_id}>
                                            {role.role_name} ({role.description})
                                        </option>
                                    ))}
                                </select>

                                <p>Gender</p>
                                <label>
                                <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={editUser.gender === "male"}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, gender: e.target.value})
                                }
                                />
                                Male
                                </label>
                                <label>
                                <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={editUser.gender === "female"}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, gender: e.target.value})
                                }
                                />
                                Female
                                </label>

                                <button onClick={updateUserById}>Update</button>
                                <button onClick={handleToggleActive}>Toggle Active</button>

                                {successMessage && <p>{successMessage}</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Users;
