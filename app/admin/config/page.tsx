"use client";

import { useState } from"react";
import toast from"react-hot-toast";

interface ConfigItem {
 key: string;
 label: string;
 description: string;
 type:"toggle"|"number";
 value: boolean | number;
}

const DEFAULT_CONFIG: ConfigItem[] = [
 {
 key:"require_approval",
 label:"Require Listing Approval",
 description:"New listings must be approved by admin before going live",
 type:"toggle",
 value: true,
 },
 {
 key:"allow_owner_listings",
 label:"Allow Owner Self-Listing",
 description:"Property owners can directly list without agent involvement",
 type:"toggle",
 value: true,
 },
 {
 key:"max_owner_listings",
 label:"Max Listings per Owner",
 description:"Maximum number of active listings an owner can have",
 type:"number",
 value: 1,
 },
 {
 key:"max_agent_listings",
 label:"Max Free Listings per Agent",
 description:"Number of free listings before subscription is required",
 type:"number",
 value: 5,
 },
 {
 key:"featured_slots",
 label:"Featured Slots per City",
 description:"Maximum number of featured listings per city at a time",
 type:"number",
 value: 10,
 },
 {
 key:"enable_sms_notifications",
 label:"SMS Notifications",
 description:"Send SMS alerts for new leads and important updates",
 type:"toggle",
 value: true,
 },
 {
 key:"enable_whatsapp_notifications",
 label:"WhatsApp Notifications",
 description:"Send WhatsApp messages for lead alerts",
 type:"toggle",
 value: false,
 },
 {
 key:"listing_expiry_days",
 label:"Listing Expiry (Days)",
 description:"Number of days before an active listing auto-expires",
 type:"number",
 value: 90,
 },
 {
 key:"enable_map_search",
 label:"Map-Based Search",
 description:"Enable Google Maps based property search for users",
 type:"toggle",
 value: false,
 },
 {
 key:"maintenance_mode",
 label:"Maintenance Mode",
 description:"Show maintenance page to all non-admin users",
 type:"toggle",
 value: false,
 },
];

export default function AdminConfigPage() {
 const [config, setConfig] = useState<ConfigItem[]>(DEFAULT_CONFIG);

 const handleToggle = (key: string) => {
 setConfig((prev) =>
 prev.map((item) =>
 item.key === key ? { ...item, value: !item.value } : item
 )
 );
 };

 const handleNumberChange = (key: string, value: number) => {
 setConfig((prev) =>
 prev.map((item) =>
 item.key === key ? { ...item, value } : item
 )
 );
 };

 const handleSave = () => {
 // Placeholder — would POST to /api/admin/config
 toast.success("Configuration saved (UI only — backend config API coming soon)");
 };

 return (
 <main className="p-6 max-w-3xl">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="text-lg font-semibold text-primary-foreground">Platform Configuration</h2>
 <p className="text-sm text-muted-foreground mt-1">Manage feature toggles and system settings</p>
 </div>
 <button
 onClick={handleSave}
 className="px-5 py-2 rounded-lg bg-accent text-primary-foreground text-sm font-medium hover:bg-accent-hover transition-colors"
 >
 Save Changes
 </button>
 </div>

 <div className="space-y-4">
 {config.map((item) => (
 <div
 key={item.key}
 className="bg-muted border border-border rounded-xl p-4 flex items-center gap-4"
 >
 <div className="flex-1 min-w-0">
 <h3 className="text-primary-foreground text-sm font-medium">{item.label}</h3>
 <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>
 </div>

 {item.type ==="toggle"? (
 <button
 onClick={() => handleToggle(item.key)}
 className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
 item.value ?"bg-accent":"bg-muted"
 }`}
 >
 <span
 className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card transition-transform ${
 item.value ?"translate-x-5":"translate-x-0"
 }`}
 />
 </button>
 ) : (
 <input
 type="number"
 value={item.value as number}
 onChange={(e) => handleNumberChange(item.key, parseInt(e.target.value) || 0)}
 min={0}
 className="w-20 px-3 py-1.5 rounded-lg bg-muted border border-border text-primary-foreground text-sm text-center focus:border-accent focus:outline-none shrink-0"
 />
 )}
 </div>
 ))}
 </div>

 <div className="mt-8 bg-muted/50 border border-border rounded-xl p-4">
 <p className="text-xs text-muted-foreground">
 Note: Configuration changes are currently UI-only. Backend persistence via <code className="text-muted-foreground">/api/admin/config</code> will be implemented with database-backed settings in a future update.
 </p>
 </div>
 </main>
 );
}
