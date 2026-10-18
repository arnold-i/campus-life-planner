import { validatePlan, validRecord } from "./validators.js";
import { loadRecords, saveRecords } from "./storage.js";

const $ = (selector) => document.querySelector(selector);
const form = $("plan-form");
const fields = {
    title: $("title"), dueDate: $("#dueDate"),
    duration: $("#duration"), tag: $("#tag"), details: $("#details")
}; 
const errorIds = { title: "#title-error", dueDate: "#date-error", duration: "#duration-error", tag: "#tag-error"};
const sample = [
    ["Finish biology report", 3, "Study", "2026-10-16"],
    ["Meet project team", 45, "Social", "2026-10-15"],
    ["Library reading", 60, "Study", "2026-10-17"],
    ["Morning run", 30, "Wellness", "2026-10-18"],
    ["Submit UX wireframes", 90, "Study", "2026-10-19"],
    ["Review lecture notes", 40, "Study", "2026-10-21"],
    ["Book dentist appointment", 10, "Wellness", "2026-10-22"],
    ["Volunteer orientation", 75, "Community", "2026-10-23"],
    ["Plan weekend groceries", 25, "Personal", "2026-10-24"],
].map(([title, duration, tag, dueDate], i) => ({
    id: `plan_${String(i + 1).padStart(4, "0")}`,
    title,
    duration,
    dueDate,
    tag,
    details: "";
    createdAt; new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
}))