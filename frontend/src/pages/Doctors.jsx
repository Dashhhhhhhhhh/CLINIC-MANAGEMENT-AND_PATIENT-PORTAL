import { useState, useEffect } from "react";
import {
  createDoctor,
  getAllDoctors,
  getDoctorsById,
  updateDoctor,
  toggleActiveDoctor,
  getAvailableUsers,
} from "../api/doctors";

function Doctors() {

  //  State Variables

  const [doctor, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  const [doctorId, setDoctorId] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [addDoctor, setAddDoctor] = useState({
    user_id: "",
    first_name: "",
    middle_initial: "",
    last_name: "",
    license_number: "",
    contact_number: "",
    specialization_id: "",
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableSpecialization, setAvailableSpecialization] = useState([]);

  const [addSpecialization, setAddSpecialization] = useState({
    specialization_id: "",
    specialization_name: "",
    description: "",
  });

  //  Fetch Doctors (Initial Load)

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setSuccessMessage("");
      setError(null);

      try {
        const result = await getAllDoctors();
        setDoctors(result.doctor);
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

    fetchDoctors();
  }, []);

  // Create Doctor Handler

  const resetForm = () => {
    setAddDoctor({
      user_id: "",
      first_name: "",
      middle_initial: "",
      last_name: "",
      license_number: "",
      contact_number: "",
      specialization_id: "",
    });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setError(null);

    try {
      const payload = {
        ...addDoctor,
        user_id: selectedUserId,
        specialization_id: selectedSpecialization,
      };

      console.log("Final payload being sent:", payload);

      const result = await createDoctor(payload);
      console.log(" Finished API call, proceeding...");
      resetForm();

      setSuccessMessage("Doctor added successfully!");
      console.log("Created doctor:", result);

      await getAllDoctors();
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

  //  Fetch Doctor by ID

  const fetchDoctorById = async () => {
    setLoading(true);
    setSuccessMessage("");
    setError(null);

    try {
      const result = await getDoctorsById(doctorId);

      if (result.success) {
        setSelectedDoctor(result.doctor);
        setSuccessMessage("Doctor retrieved successfully!");
      } else {
        setError({ message: result.message || "Doctor not found" });
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

  // Update Doctors Details

    const [editDoctor, setEditDoctor] = useState({
        doctor_id: "",
        first_name: "",
        middle_initial: "",
        last_name: "",
        contact_number: "",
        specialization_id: ""
    });

    const [isEditing, setIsEditing] = useState(false);

    const updateDoctorByID = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);
        console.log("Updating Doctor with ID", editDoctor.doctor_id);
        try {
            console.log("editDoctor before udpated:", editDoctor);

            const result = await updateDoctor(editDoctor.doctor_id, {
                first_name: editDoctor.first_name,
                middle_initial: editDoctor.middle_initial,
                last_name: editDoctor.last_name,
                contact_number: editDoctor.contact_number,
                specialization_id: editDoctor.specialization_id                
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

  //  Fetch Toggle Status
      
    const handleToggleActive = async () => {
        setLoading(true);
        setSuccessMessage("");
        setError(null);
        
        const newStatus = !selectedDoctor.active;
        try {

            const result = await toggleActiveDoctor(selectedDoctor.doctor_id, !selectedDoctor.active);

            setSelectedDoctor(prev => ({ ...prev, active: !prev.active }));

            if (newStatus) {
                setSuccessMessage("Doctor activated successfully");
            } else {
                setSuccessMessage("Doctor deactivated successfully");
            }
            console.log("Doctor active status toggled successfully");

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

  //  Fetch Available Users

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/doctors/available-users");
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

  const handleUserChange = async (e) => {
    const { name, value } = e.target;
    setAddDoctor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  Fetch Available Specializations

  useEffect(() => {
    const fetchAvailableSpecialization = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/specializations/available"
        );
        const data = await response.json();

        if (data.success) {
          setAvailableSpecialization(data.specialization);
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

    fetchAvailableSpecialization();
  }, []);

  const handleSpecializationChange = async (e) => {
    const { name, value } = e.target;
    setAddSpecialization((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  Render Section

  if (loading) return <p>Loading Doctors...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* ================= Doctor List ================= */}
      <h2>Doctors Lists</h2>
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
          {doctor.map((doctor, index) => (
            <tr key={doctor.doctor_id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {doctor.doctor_id}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {doctor.first_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= Create Doctor Form ================= */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Create Doctor</h2>
        <form>
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
            value={addDoctor.first_name}
            onChange={(e) =>
              setAddDoctor({ ...addDoctor, first_name: e.target.value })
            }
          />

          <p>Middle Initial</p>
          <input
            type="text"
            placeholder="Enter middle initial"
            value={addDoctor.middle_initial}
            onChange={(e) =>
              setAddDoctor({ ...addDoctor, middle_initial: e.target.value })
            }
          />

          <p>Last Name</p>
          <input
            type="text"
            placeholder="Enter last name"
            value={addDoctor.last_name}
            onChange={(e) =>
              setAddDoctor({ ...addDoctor, last_name: e.target.value })
            }
          />

          <p>License Number</p>
          <input
            type="text"
            placeholder="Enter license number"
            value={addDoctor.license_number}
            onChange={(e) =>
              setAddDoctor({ ...addDoctor, license_number: e.target.value })
            }
          />

            <p>Contact Number</p>
            <input
                type="text"
                placeholder="e.g., 09123456789"
                value={addDoctor.contact_number}
                onChange={(e) => {
                    const raw = e.target.value.trim();

                    if (raw.startsWith("09")) {
                        const converted = "+639" + raw.slice(2);
                        setAddDoctor({ ...addDoctor, contact_number: converted });
                        return;
                    }

                    if (raw.startsWith("+639")) {
                        setAddDoctor({ ...addDoctor, contact_number: raw });
                        return;
                    }

                    const valid = /^\+?[0-9]*$/.test(raw);
                    if (!valid) return;

                    setAddDoctor({ ...addDoctor, contact_number: raw });
                }}
            />

          <p>Specialization</p>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <option value="">Select a Specialization</option>
            {availableSpecialization.map((specialization) => (
              <option
                key={specialization.specialization_id}
                value={specialization.specialization_id}
              >
                {specialization.specialization_name} (
                {specialization.description})
              </option>
            ))}
          </select>

          <button onClick={handleAddDoctor}>Submit</button>

          {successMessage && <p>{successMessage}</p>}
        </form>
      </div>

      {/* ================= Search Doctor By ID ================= */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Search by Doctor's ID</h3>

        <input
          placeholder="Enter Doctor's ID"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
        />

        <button onClick={fetchDoctorById}>Search</button>
    
        {selectedDoctor && (
            <div> 
                <p>doctor_id: {selectedDoctor.doctor_id}</p>
                <p>first_name: {selectedDoctor.first_name}</p>
                <p>middle_initial: {selectedDoctor.middle_initial}</p>
                <p>last_name: {selectedDoctor.last_name}</p>
                <p>license_number: {selectedDoctor.license_number}</p>
                <p>contact_number: {selectedDoctor.contact_number}</p>
                <p>specialization: {selectedDoctor.specialization?.specialization_name}</p>
                <p>active: {selectedDoctor.active ? "Active" : "Inactive"}</p>

            {/* ================= Update Doctor By ID ================= */}

                <button onClick={() => {
                    setEditDoctor(selectedDoctor);
                    setIsEditing(true);
                }}
                >
                    Edit
                </button>
                {isEditing && (
                <div style={{ marginTop: "1rem" }}>
                   <h4>Edit Doctor</h4>
                   <p>First Name</p>    
                        <input
                        type="text"
                        placeholder="Enter First Name"
                        value={editDoctor.first_name}
                        onChange={(e) => setEditDoctor({ ...editDoctor, first_name: e.target.value })}
                        />
                   <p>Middle Initial</p>
                        <input
                        type="text"
                        placeholder="Enter Middle Initial"
                        value={editDoctor.middle_initial || ""}
                        onChange={(e) => setEditDoctor({ ...editDoctor, middle_initial: e.target.value })}
                        />
                   <p>Last Name</p>
                        <input
                        type="text"
                        placeholder="Enter Last Name"
                        value={editDoctor.last_name}
                        onChange={(e) => setEditDoctor({ ...editDoctor, last_name: e.target.value })}
                        />
                   <p>Contact Number</p>
                        <input
                        type="text"
                        placeholder="Enter Contact Number"
                        value={editDoctor.contact_number || ""}
                        onChange={(e) => setEditUser({ ...editDoctor, contact_number: e.target.value })}
                        /> 
                   <p>Specialization</p>
                        <select
                            value={editDoctor.doctor_id || ""}
                            onChange={(e) =>
                                setEditDoctor({ ...editDoctor, specialization_id: e.target.value })
                            }
                        >
                            <option value="">Select a Specialization</option>
                            {availableSpecialization.map((specialization) => (
                            <option
                                key={specialization.specialization_id}
                                value={specialization.specialization_id}
                            >
                                {specialization.specialization_name} (
                                {specialization.description})
                            </option>
                            ))}
                        </select>
                        <button onClick={updateDoctorByID}>Update</button>

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

export default Doctors;
