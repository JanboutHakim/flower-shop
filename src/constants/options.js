import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";   // <-- adjust to your client path

export const FLOWER_OPTS = ["roses", "tulips", "lilies", "sunflowers", "peonies", "orchids"];
export const COLOR_OPTS = ["red", "white", "pink", "yellow", "purple", "orange"];
export const RIBBON_OPTS = ["gold", "silver", "black", "pink"];
export const WRAP_OPTS = ["natural", "elegant", "modern", "rustic"];
