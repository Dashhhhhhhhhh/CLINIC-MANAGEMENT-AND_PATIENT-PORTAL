import { useState, useEffect } from "react";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  toggleActiveStaff,
  getAvailablePosition,
} from "../api/staff";

function Staff() {
  // State Variables

  // fetchAll Variables
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);

  // handleAdd Variables

  const [addStaff, setAddStaff] = useState({
    user_id: "",
    first_name: "",
    middle_initial: "",
    last_name: "",
    employee_number: "",
    contact_number: "",
    position_id: "",
  });

  // dropdown Position Variables

  const [selectedPosition, setSelectedPosition] = useState("");
  const [availablePosition, setAvailablePosition] = useState([]);

  // dropdown User Variables
  const [selectedUserId, setSelectedUserId] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);

  // getStaffById Variables

  const [staffId, setStaffId] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  // Fetch Staff (Initial Load)

  useEffect(() => {
    const fetchStaffs = async () => {
      setLoading(true);
      setSuccessMessage("");
      setError(null);

      try {
        const result = await getAllStaff();
        setStaff(result.staff);
      
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

    fetchStaffs();
  }, []);

  //Fetch Available Users

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await fetch(
        "http://localhost:3000/staff/available-users");
        const data = await response.json();

        if (data.success) {
          setAvailableUsers(data.users);
        }
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

    fetchAvailableUsers();
  }, []);

  // Fetch Staff by ID

  const fetchStaffById = async () => {
    try {
      const result = await getStaffById(staffId);

      if (result.success) {
        setSelectedStaff(result.staff);
        setSuccessMessage("Staff retrieved successfully!");
      } else {
        setError({ message: result.message || "Staff not found" });
      }
    } catch (error) {
      let errorMessage = "";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Server error occurred";
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

  // Update Staff Details

  const [editStaff, setEditStaff] = useState({
    staff_id: "",
    first_name: "",
    middle_initial: "",
    last_name: "",
    contact_number: "",
    position_id: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  
  const updateStaffById = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);
        console.log("Updating Doctor with ID", editStaff.staff_id); 
        try {
            console.log("editStaff before updated:", editStaff);
          console.log("Selected staff before editing:", selectedStaff);
          console.log("Updating staff with ID:", editStaff.staff_id);
            const result= await updateStaff(editStaff.staff_id, {
                first_name: editStaff.first_name,
                middle_initial: editStaff.middle_initial,
                last_name: editStaff.last_name,
                contact_number: editStaff.contact_number,
                position_id: editStaff.position_id
            });
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

   // Handle Toggle Status

   const handleToggleActive = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);
        
        const newStatus = !selectedStaff.active;
        try {
            
            const result = await toggleActiveStaff(selectedStaff.staff_id,!selectedStaff.active );
            
            setSelectedStaff(prev => ({ ...prev, active: !prev.active }));

            if (newStatus) {
                setSuccessMessage("Staff activated successfully");
            } else {
                setSuccessMessage("Staff deactivated successfully");
            }
            console.log("Staff active status toggeld successfully");

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

  //Fetch Available Positions

  useEffect(() => {
    const fetchAvailablePositions = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/positions/available"
        );
        const data = await response.json();
        if (data.success) {
          setAvailablePosition(data.position);
        }
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

    fetchAvailablePositions();
  }, []);

  // create Staff Handle

  const resetForm = () => {
    setAddStaff({
      user_id: "",
      first_name: "",
      middle_initial: "",
      last_name: "",
      employee_number: "",
      contact_number: "",
      position_id: "",
    });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setError(null);

    try {
      const payload = {
        ...addStaff,
        user_id: selectedUserId,
        position_id: selectedPosition,
      };

      console.log("Final payload being sent:", payload);

      const result = await createStaff(payload);
      console.log("Finished API call, proceeding...");
      resetForm();

      setSuccessMessage("Staff added successfully!");
      console.log("Staff create:", result);
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

  if (loading) return <p>Loading Staff...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* ================= Staff List ================= */}
      <h2>Staff's Lists</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              First Name
            </th>
          </tr>
        </thead>
        <tbody>
          {staff.map((staff, index) => (
            <tr key={staff.staff_id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {staff.staff_id}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {staff.first_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= Create Staff Form ================= */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Create Staff</h2>
        <form onSubmit={handleAddStaff}>
          <p>User ID</p>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">--Select a User--</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
          <p>First Name</p>
          <input
            type="text"
            placeholder="Enter first name"
            value={addStaff.first_name}
            onChange={(e) =>
              setAddStaff({ ...addStaff, first_name: e.target.value })
            }
          />
          <p>Middle Initial</p>
          <input
            type="text"
            placeholder="Enter Middle Initial"
            value={addStaff.middle_initial}
            onChange={(e) =>
              setAddStaff({ ...addStaff, middle_initial: e.target.value })
            }
          />
          <p>Last Name</p>
          <input
            type="text"
            placeholder="Enter Last name"
            value={addStaff.last_name}
            onChange={(e) =>
              setAddStaff({ ...addStaff, last_name: e.target.value })
            }
          />
            <p>Contact Number</p>
            <input
                type="text"
                placeholder="e.g., 09123456789"
                value={addStaff.contact_number}
                onChange={(e) => {
                    const raw = e.target.value.trim();

                    if (raw.startsWith("09")) {
                        const converted = "+639" + raw.slice(2);
                        setAddStaff({ ...addStaff, contact_number: converted });
                        return;
                    }

                    if (raw.startsWith("+639")) {
                        setAddStaff({ ...addStaff, contact_number: raw });
                        return;
                    }

                    const valid = /^\+?[0-9]*$/.test(raw);
                    if (!valid) return;

                    setAddStaff({ ...addStaff, contact_number: raw });
                }}
            />
          <p>Position</p>
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
          >
            <option value="">--Select a Position--</option>
            {availablePosition.map((position) => (
              <option
                key={position.position_id}
                value={position.position_id}
              >
                {position.position_name}
              </option>
            ))}
          </select>

          <button type="submit">Submit</button>

          {successMessage && <p>{successMessage}</p>}
        </form>
      </div>

      {/* ================= Search Staff By ID ================= */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Search by Staff ID</h3>

        <input
          placeholder="Enter Staff ID"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
        />

        <button onClick={fetchStaffById}>Search</button>

        {selectedStaff && (
          <div>
            <p>staff_id: {selectedStaff.staff_id}</p>
            <p>first_name: {selectedStaff.first_name}</p>
            <p>middle_initial: {selectedStaff.middle_initial}</p>
            <p>last_name: {selectedStaff.last_name}</p>
            <p>employee_number: {selectedStaff.employee_number}</p>
            <p>contact_number: {selectedStaff.contact_number}</p>
            <p>position: {selectedStaff.position?.position_name}</p>
            <p>active: {selectedStaff.active ? "Active" : "Inactive"}</p>

            {/* ================= Update Doctor By ID ================= */}

            <button onClick={() => {
                setEditStaff(selectedStaff);
                setIsEditing(true);
            }}
            >
                Edit
            </button>
            {isEditing && (
            <div style={{ marginTop: "1rem" }}>
                <h4>Edit Staff</h4>
                <p>First Name</p>
                <input
                text="text"
                placeholder="Enter First Name"
                value={editStaff.first_name}
                onChange={(e) => setEditStaff({ ...editStaff, first_name: e.target.value })}
                />
                <p>Middle Initial</p>
                <input
                text="text"
                placeholder="Enter Middle Initial"
                value={editStaff.middle_initial || ""}
                onChange={(e) => setEditStaff({ ...editStaff, middle_initial: e.target.value })}
                />
                <p>Last Name</p>
                <input
                text="text"
                placeholder="Enter Last Name"
                value={editStaff.last_name}
                onChange={(e) => setEditStaff({ ...editStaff, last_name: e.target.value })}
                />
                <p>Contact Number</p>
                <input
                text="text"
                placeholder="Enter Contact Number"
                value={editStaff.contact_number || ""}
                onChange={(e) => setEditStaff({ ...editStaff, contact_number: e.target.value })}
                />
                <p>Position</p>
                <select
                    value={editStaff.position_id || ""}
                    onChange={(e) =>
                        setEditStaff({ ...editStaff, position_id: e.target.value })
                    }
                >
                    <option value="">Select a Position</option>
                    {availablePosition.map((position) => (
                    <option
                        key={position.position_id}
                        value={position.position_id}
                    >
                        {position.position_name} 
                    </option>
                    ))}
                </select>
                <button onClick={updateStaffById}>Update</button>

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

export default Staff;
