function getTimelineFromKitID(kitID) {
    if (kitID.startsWith("HGUC")) {
      return "Universal Century";
    } else if (kitID.startsWith("HGCE") || kitID.startsWith("HGSEED")) {
      return "Cosmic Era";
    } else if (kitID.startsWith("HGCC")) {
      return "Correct Century";
    } else if (kitID.startsWith("HGAC")) {
      return "After Colony";
    } else if (kitID.startsWith("HGFC")) {
      return "Future Century";
    } else if (kitID.startsWith("HGAW")) {
      return "After War";
    } else if (kitID.startsWith("HGCDI") || kitID.startsWith("HGTO")) {
      return "Universal Century (Origin)";
    } else if (kitID.startsWith("HGTB")) {
      return "Universal Century (Thunderbolt)";
    } else if (kitID.startsWith("HGWFM")) {
      return "Ad Stella";
    } else if (kitID.startsWith("HGRIG")) {
      return "Regild Century";
    } else if (kitID.startsWith("AG") || kitID.startsWith("HGAGE")) {
      return "Advanced Generation";
    } else if (kitID.startsWith("HGDZ")) {
      return "Anno Domini (00)";
    } else if (kitID.startsWith("HGIBO")) {
      return "Post Disaster";
    } else if (kitID.startsWith("HGRG")) {
      return "Anno Domini (00)";
    } else {
      return ""; // or handle the case when the kitID doesn't match any pattern
    }
}

export default getTimelineFromKitID;