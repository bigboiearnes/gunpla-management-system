function getTimelineFromKitID(kitID) {
    if (kitID.startsWith("HGUC") || kitID.startsWith("HGUCR")) {
      return "Universal Century";
    } else if (kitID.startsWith("HGCE")) {
      return "Cosmic Era";
    } else if (kitID.startsWith("HGAC")) {
      return "After Colony";
    } else if (kitID.startsWith("HGFC")) {
      return "Future Century";
    } else if (kitID.startsWith("HGAW")) {
      return "After War";
    } else {
      return "Unknown"; // or handle the case when the kitID doesn't match any pattern
    }
  }

export default getTimelineFromKitID;