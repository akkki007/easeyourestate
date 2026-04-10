"use client";

import { useEffect, useState, useCallback } from"react";
import { useAuth, getUserDisplayName } from"@/lib/auth/AuthContext";
import DashboardHeader from"@/components/dashboard/DashboardHeader";
import toast from"react-hot-toast";

const ROLE_OPTIONS = [
 { value:"buyer", label:"Buyer", description:"Looking to buy a property", icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},
 { value:"tenant", label:"Tenant", description:"Looking to rent a property or PG", icon:"M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"},
 { value:"owner", label:"Property Owner", description:"List your property for sale or rent", icon:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"},
];

interface ProfileData {
 _id: string;
 name: { first: string; last: string };
 email: string;
 phone: string;
 avatar?: string;
 role: string;
 createdAt: string;
}

export default function ProfilePage() {
 const { token, user, login } = useAuth();
 const [profile, setProfile] = useState<ProfileData | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [editMode, setEditMode] = useState(false);

 // Form state
 const [firstName, setFirstName] = useState("");
 const [lastName, setLastName] = useState("");
 const [email, setEmail] = useState("");
 const [avatarUrl, setAvatarUrl] = useState("");
 const [selectedRole, setSelectedRole] = useState("");
 const [uploadingAvatar, setUploadingAvatar] = useState(false);

 const fetchProfile = useCallback(async () => {
 if (!token) return;
 try {
 const res = await fetch("/api/user/profile", {
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error("Failed to load profile");
 const data = await res.json();
 setProfile(data.user);
 setFirstName(data.user.name?.first ||"");
 setLastName(data.user.name?.last ||"");
 setEmail(data.user.email ||"");
 setAvatarUrl(data.user.avatar ||"");
 setSelectedRole(data.user.role ||"buyer");
 } catch {
 toast.error("Failed to load profile");
 } finally {
 setLoading(false);
 }
 }, [token]);

 useEffect(() => {
 fetchProfile();
 }, [fetchProfile]);

 const handleSaveProfile = async () => {
 if (!token || !firstName.trim()) {
 toast.error("First name is required");
 return;
 }

 setSaving(true);
 try {
 const res = await fetch("/api/user/profile", {
 method:"PUT",
 headers: {
"Content-Type":"application/json",
 Authorization:`Bearer ${token}`,
 },
 body: JSON.stringify({
 name: { first: firstName.trim(), last: lastName.trim() },
 email: email.trim(),
 avatar: avatarUrl.trim() || undefined,
 }),
 });

 if (!res.ok) {
 const err = await res.json();
 throw new Error(err.error ||"Failed to update profile");
 }

 const data = await res.json();
 setProfile(data.user);
 setEditMode(false);

 // Update AuthContext so the whole app reflects the change
 if (user) {
 login(token, {
 ...user,
 name: data.user.name,
 email: data.user.email,
 avatar: data.user.avatar,
 });
 }

 toast.success("Profile updated");
 } catch (err: unknown) {
 toast.error(err instanceof Error ? err.message :"Failed to update");
 } finally {
 setSaving(false);
 }
 };

 const userName = getUserDisplayName(user);
 const userEmail = typeof user?.email ==="string"? user.email :"";

 if (loading) {
 return (
 <>
 <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Profile"/>
 <main className="p-6">
 <div className="flex items-center justify-center py-20">
 <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
 </div>
 </main>
 </>
 );
 }

 return (
 <>
 <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Profile"/>
 <main className="p-6 max-w-4xl">
 {/* Profile Card */}
 <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
 {/* Cover gradient */}
 <div className="h-32 bg-gradient-to-r from-accent to-accent-hover"/>

 <div className="px-6 pb-6">
 {/* Avatar + Name section */}
 <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
 <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card flex items-center justify-center text-3xl font-bold text-accent shadow-lg">
 {profile?.avatar ? (
 <img
 src={profile.avatar}
 alt="Avatar"
 className="w-full h-full object-cover rounded-2xl"
 />
 ) : (
 firstName.charAt(0).toUpperCase() ||"U"
 )}
 </div>

 <div className="flex-1 min-w-0 pb-1">
 <h2 className="text-xl font-semibold text-primary">
 {profile?.name?.first} {profile?.name?.last}
 </h2>
 <p className="text-sm text-muted-foreground">{profile?.email || profile?.phone}</p>
 </div>

 <button
 onClick={() => setEditMode(!editMode)}
 className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-hover transition-colors"
 >
 {editMode ?"Cancel":"Edit Profile"}
 </button>
 </div>

 {/* Info display / edit form */}
 {editMode ? (
 <div className="mt-6 space-y-4">
 <div className="grid sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1.5">First Name *</label>
 <input
 type="text"
 value={firstName}
 onChange={(e) => setFirstName(e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 text-sm text-primary"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1.5">Last Name</label>
 <input
 type="text"
 value={lastName}
 onChange={(e) => setLastName(e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 text-sm text-primary"
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 text-sm text-primary"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1.5">Avatar</label>
 <div className="flex items-center gap-4">
 {avatarUrl && (
 <img src={avatarUrl} alt="Avatar preview"className="w-12 h-12 rounded-xl object-cover border border-border"/>
 )}
 <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium cursor-pointer hover:bg-hover transition-colors ${uploadingAvatar ?"opacity-50 pointer-events-none":"text-muted-foreground"}`}>
 <svg className="w-4 h-4"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
 </svg>
 {uploadingAvatar ?"Uploading...":"Upload Image"}
 <input
 type="file"
 accept="image/jpeg,image/png,image/webp,image/gif"
 className="hidden"
 disabled={uploadingAvatar}
 onChange={async (e) => {
 const file = e.target.files?.[0];
 if (!file || !token) return;
 setUploadingAvatar(true);
 try {
 const formData = new FormData();
 formData.append("file", file);
 const res = await fetch("/api/upload", {
 method:"POST",
 headers: { Authorization:`Bearer ${token}`},
 body: formData,
 });
 if (!res.ok) {
 const err = await res.json();
 throw new Error(err.error ||"Upload failed");
 }
 const data = await res.json();
 setAvatarUrl(data.url);
 toast.success("Avatar uploaded");
 } catch (err: unknown) {
 toast.error(err instanceof Error ? err.message :"Upload failed");
 } finally {
 setUploadingAvatar(false);
 e.target.value ="";
 }
 }}
 />
 </label>
 {avatarUrl && (
 <button
 type="button"
 onClick={() => setAvatarUrl("")}
 className="text-xs text-error hover:underline"
 >
 Remove
 </button>
 )}
 </div>
 </div>

 {/* Phone (read-only) */}
 {profile?.phone && (
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone</label>
 <input
 type="text"
 value={profile.phone}
 disabled
 className="w-full px-4 py-2.5 rounded-xl bg-hover border border-border text-sm text-tertiary cursor-not-allowed"
 />
 <p className="text-xs text-tertiary mt-1">Phone number cannot be changed</p>
 </div>
 )}

 <div className="flex gap-3 pt-2">
 <button
 onClick={handleSaveProfile}
 disabled={saving}
 className="px-6 py-2.5 rounded-xl bg-accent text-primary-foreground text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
 >
 {saving ?"Saving...":"Save Changes"}
 </button>
 <button
 onClick={() => {
 setEditMode(false);
 setFirstName(profile?.name?.first ||"");
 setLastName(profile?.name?.last ||"");
 setEmail(profile?.email ||"");
 setAvatarUrl(profile?.avatar ||"");
 }}
 className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-hover transition-colors"
 >
 Cancel
 </button>
 </div>
 </div>
 ) : (
 <div className="mt-6 grid sm:grid-cols-2 gap-4">
 <InfoField label="First Name"value={profile?.name?.first ||"-"} />
 <InfoField label="Last Name"value={profile?.name?.last ||"-"} />
 <InfoField label="Email"value={profile?.email ||"-"} />
 <InfoField label="Phone"value={profile?.phone ||"-"} />
 <InfoField
 label="Member Since"
 value={
 profile?.createdAt
 ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
 year:"numeric",
 month:"long",
 day:"numeric",
 })
 :"-"
 }
 />
 </div>
 )}
 </div>
 </div>

 {/* Role Display (Read-only) */}
 <div className="bg-card rounded-2xl border border-border p-6">
  <h3 className="text-lg font-semibold text-primary mb-1">Role</h3>
  <p className="text-sm text-muted-foreground mb-5">
   Your current role determines your dashboard experience and available features.
  </p>

  {(() => {
   const currentRole = ROLE_OPTIONS.find((r) => r.value === selectedRole) || ROLE_OPTIONS[0];
   return (
    <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-accent bg-accent/5">
     <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-accent text-primary-foreground">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
       <path strokeLinecap="round" strokeLinejoin="round" d={currentRole.icon} />
      </svg>
     </div>
     <div className="min-w-0">
      <p className="font-medium text-primary text-sm">{currentRole.label}</p>
      <p className="text-xs text-tertiary mt-0.5">{currentRole.description}</p>
     </div>
     <div className="ml-auto flex-shrink-0">
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
       <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
     </div>
    </div>
   );
  })()}

  <p className="text-xs text-tertiary mt-3">
   To change your role, please contact support.
  </p>
 </div>

 </main>
 </>
 );
}

function InfoField({ label, value }: { label: string; value: string }) {
 return (
 <div>
 <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-1">{label}</p>
 <p className="text-sm text-primary">{value}</p>
 </div>
 );
}
