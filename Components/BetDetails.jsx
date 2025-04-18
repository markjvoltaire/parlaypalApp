import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Custom progress bar built from scratch using basic View components.
// The fill color adjusts depending on the progress value.
const CustomProgressBar = ({
  progress = 0,
  height = 6,
  backgroundColor = "#3A3E47",
}) => {
  // Determine color based on the progress percentage:
  // - Below 30%: red (#ef4444)
  // - 30% to 60%: amber (#facc15)
  // - Above 60%: green (#4ade80)
  const getColor = (progressVal) => {
    if (progressVal < 0.3) return "#ef4444";
    else if (progressVal < 0.6) return "#facc15";
    else return "#4ade80";
  };

  const fillColor = getColor(progress);

  return (
    <View style={[styles.progressContainer, { height, backgroundColor }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${progress * 100}%`, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
};

// A card component that displays bet details and its analysis using the custom progress bar.
const BetCard = ({ league, bet, betSubtitle, odds, probability, analysis }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Header Row: League Information */}
      <View style={styles.headerRow}>
        <Text style={styles.leagueText}>{league}</Text>
      </View>

      {/* Main Bet Information */}
      <View style={styles.betInfo}>
        <Text style={styles.betTitle}>{bet}</Text>
        {betSubtitle ? (
          <Text style={styles.betSubtitle}>{betSubtitle}</Text>
        ) : null}

        <View style={styles.oddsContainer}>
          <Text style={styles.oddsText}>Odds: {odds}</Text>
          <Text style={styles.probabilityText}>
            Win Probability: {probability}%
          </Text>
        </View>

        {/* Custom progress bar using the probability value */}
        <CustomProgressBar
          progress={probability / 100}
          height={6}
          backgroundColor="#3A3E47"
        />
      </View>

      {/* Analysis Section */}
      <View style={styles.analysisContainer}>
        <Text style={styles.analysisHeader}>Analysis</Text>
        <Text style={styles.analysisItem}>
          <Text style={styles.analysisLabel}>Key Stat: </Text>
          {analysis.keyStat || "N/A"}
        </Text>
        <Text style={styles.analysisItem}>
          <Text style={styles.analysisLabel}>Matchup: </Text>
          {analysis.matchup || "N/A"}
        </Text>
        {/* <Text style={styles.analysisItem}>
          <Text style={styles.analysisLabel}>Confidence: </Text>
          {analysis.confidence || "N/A"}
        </Text> */}
      </View>
    </View>
  );
};

export default function CombinedBetDetails({ bets }) {
  // Log original data.
  // console.log("Bet Slip :>>", bets.data.slipInfo);
  // console.log("Game Analysis :>>", bets.data.analysis);

  // Parse bet slip info if it's a JSON string.
  let betSlip = bets.data.slipInfo;
  if (typeof betSlip === "string") {
    try {
      betSlip = JSON.parse(betSlip);
    } catch (error) {
      console.error("Failed to parse slipInfo as JSON:", error);
      betSlip = {};
    }
  }

  // Parse analysis data if it's a JSON string.
  let analysisData = bets.data.analysis;
  if (typeof analysisData === "string") {
    try {
      analysisData = JSON.parse(analysisData);
    } catch (error) {
      console.error("Failed to parse analysis as JSON:", error);
      analysisData = {};
    }
  }

  // Use a global counter to map each bet with its corresponding analysis entry.
  let analysisIndex = 0;
  const updatedBetSlip = {
    ...betSlip,
    leagues: (betSlip?.leagues || []).map((league) => ({
      ...league,
      parlay_bets: (league?.parlay_bets || []).map((bet) => {
        // Get the next analysis from the global array.
        const correspondingAnalysis =
          (analysisData?.bets || [])[analysisIndex] || {};
        analysisIndex++;
        return {
          ...bet,
          // Attach the analysis values to the bet.
          key_stat: correspondingAnalysis.analysis?.key_stat,
          matchup_consideration:
            correspondingAnalysis.analysis?.matchup_consideration,
          confidence_level: correspondingAnalysis.analysis?.confidence_level,
        };
      }),
    })),
  };

  console.log("Updated Bet Slip with Analysis :>>", updatedBetSlip.leagues);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Combined Bet Details</Text>
      {(updatedBetSlip.leagues || []).map((league, leagueIndex) => (
        <View key={leagueIndex} style={styles.leagueContainer}>
          {(league.parlay_bets || []).map((bet, betIndex) => (
            <BetCard
              key={betIndex}
              league={league.league}
              bet={bet.detail}
              betSubtitle={""}
              odds={bet.odds || ""}
              probability={bet.probability || bet.winProbability || 0}
              analysis={{
                keyStat: bet.key_stat,
                matchup: bet.matchup_consideration,
                confidence: bet.confidence_level,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Overall container styles.
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1C2135",
    borderRadius: 10,
  },
  header: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  // League container.
  leagueContainer: {
    marginBottom: 16,
  },
  leagueTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "#FFFFFF",
  },
  // BetCard styles.
  cardContainer: {
    backgroundColor: "#272C3F",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  leagueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  betInfo: {
    marginBottom: 12,
  },
  betTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  betSubtitle: {
    color: "#A1A1A1",
    fontSize: 14,
    marginBottom: 8,
  },
  oddsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  oddsText: {
    color: "#B3B3B3",
    fontSize: 14,
  },
  probabilityText: {
    color: "#B3B3B3",
    fontSize: 14,
  },
  analysisContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#3A3E47",
    paddingTop: 8,
  },
  analysisHeader: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  analysisItem: {
    color: "#B3B3B3",
    fontSize: 15,
    marginBottom: 2,
  },
  analysisLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  betTypeContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  betTypeLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  betTypeValue: {
    color: "#4ADE80",
    fontSize: 14,
    fontWeight: "600",
  },
  // CustomProgressBar styles.
  progressContainer: {
    width: "100%",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
});
