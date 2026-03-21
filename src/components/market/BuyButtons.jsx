import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Spacing } from "../../constants/theme";
import { formatPrice } from "../../utils/formatters";
import API_BASE_URL from "../../config/api";
import PurchaseModal from "./PurchaseModal";
import BasketballIcon from "../ui/BasketballIcon";
import { useAuth } from "../../contexts/AuthContext";

const WEBSOCKET_URL = "wss://dev-prediction-markets-api.dflow.net/api/v1/ws";

function calculateMidPrice(bid, ask) {
  if (!bid && !ask) return null;
  if (!bid) return parseFloat(ask);
  if (!ask) return parseFloat(bid);
  return (parseFloat(bid) + parseFloat(ask)) / 2;
}

export default function BuyButtons({
  awayTeam,
  homeTeam,
  event,
  onSideSelect,
  userPublicKey,
  isBasketball = false,
  /** Match parent screen when it forces dark UI (e.g. EventDetail) */
  forceDark = false,
}) {
  const { signAndSendSolanaTransaction, solanaAddress, walletAddress: authWalletAddress, proofToken } = useAuth();
  const navigation = useNavigation();
  const systemDark = useColorScheme() !== "light";
  const isDarkMode = forceDark || systemDark;
  const ESPN_PALETTE = {
    black: "#000000",
    red: "#E52534",
    silver: "#A0A0A0",
  };
  const theme = useMemo(
    () =>
      isDarkMode
        ? {
            background: ESPN_PALETTE.black,
            borderTop: "rgba(255, 255, 255, 0.1)",
            buttonText: "#FFFFFF",
            buttonFill: "rgba(255,255,255,0.07)",
          }
        : {
            background: "#F5F7FB",
            borderTop: "rgba(17, 24, 39, 0.12)",
            buttonText: "#111827",
            buttonFill: "rgba(0,0,0,0.04)",
          },
    [isDarkMode]
  );
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.borderTop,
        },
        buttonRow: {
          flexDirection: "row",
          gap: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.sm,
          paddingBottom: Spacing.sm,
          backgroundColor: theme.background,
        },
        button: {
          flex: 1,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 12,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexDirection: "row",
          borderWidth: 2,
        },
        buttonContent: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        },
        buttonText: {
          fontSize: 15,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
      }),
    [theme]
  );

  const [selectedSide, setSelectedSide] = useState(null);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [buyModalSide, setBuyModalSide] = useState(null);
  const [buyError, setBuyError] = useState(null);
  const [buySending, setBuySending] = useState(false);
  const wsRef = useRef(null);
  const [realtimePrices, setRealtimePrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Extract tickers and yes prices from event markets
  const {
    awayTicker,
    homeTicker,
    awayYesBid,
    awayYesAsk,
    homeYesBid,
    homeYesAsk,
  } = useMemo(() => {
    if (!event?.markets || event.markets.length < 2) {
      return {
        awayTicker: null,
        homeTicker: null,
        awayYesBid: null,
        awayYesAsk: null,
        homeYesBid: null,
        homeYesAsk: null,
      };
    }

    // event.markets[0] is home team, event.markets[1] is away team
    const homeMarket = event.markets[0];
    const awayMarket = event.markets[1];

    return {
      awayTicker: awayMarket?.ticker || null,
      homeTicker: homeMarket?.ticker || null,
      awayYesBid: awayMarket?.yesBid || null,
      awayYesAsk: awayMarket?.yesAsk || null,
      homeYesBid: homeMarket?.yesBid || null,
      homeYesAsk: homeMarket?.yesAsk || null,
    };
  }, [event?.markets]);

  // Get real-time prices for display
  const awayPrice = useMemo(() => {
    if (awayTicker && realtimePrices[awayTicker] !== undefined) {
      return realtimePrices[awayTicker];
    }
    // Fallback to yesBid if available
    if (awayYesBid) return parseFloat(awayYesBid);
    return null;
  }, [awayTicker, realtimePrices, awayYesBid]);

  const homePrice = useMemo(() => {
    if (homeTicker && realtimePrices[homeTicker] !== undefined) {
      return realtimePrices[homeTicker];
    }
    // Fallback to yesBid if available
    if (homeYesBid) return parseFloat(homeYesBid);
    return null;
  }, [homeTicker, realtimePrices, homeYesBid]);

  // Format prices for display
  const displayAwayPrice = useMemo(() => {
    if (awayPrice !== null && awayPrice !== undefined) {
      return formatPrice(awayPrice);
    }
    return "TBD";
  }, [awayPrice]);

  const displayHomePrice = useMemo(() => {
    if (homePrice !== null && homePrice !== undefined) {
      return formatPrice(homePrice);
    }
    return "TBD";
  }, [homePrice]);

  // Fetch initial prices from batch API
  useEffect(() => {
    const marketTickers = [];
    if (awayTicker) marketTickers.push(awayTicker);
    if (homeTicker) marketTickers.push(homeTicker);

    if (marketTickers.length === 0) return;

    const fetchInitialPrices = async () => {
      try {
        setLoadingPrices(true);
        const response = await fetch(
          `${API_BASE_URL}/api/v1/markets/batch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tickers: marketTickers,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Process the response and set initial prices
        // Assuming the response is an array of market objects with ticker and prices
        if (Array.isArray(data)) {
          const initialPrices = {};
          data.forEach((market) => {
            if (market.ticker && (market.yes_bid || market.yes_ask)) {
              const midPrice = calculateMidPrice(
                market.yes_bid,
                market.yes_ask
              );
              if (midPrice !== null) {
                initialPrices[market.ticker] = midPrice;
              }
            }
          });

          if (Object.keys(initialPrices).length > 0) {
            // Set initial prices from fetch response
            setRealtimePrices(initialPrices);
          }
        }
      } catch (error) {
        console.error("Error fetching initial prices:", error);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchInitialPrices();
  }, [awayTicker, homeTicker]);

  // WebSocket connection for prices
  useEffect(() => {
    const marketTickers = [];
    if (awayTicker) marketTickers.push(awayTicker);
    if (homeTicker) marketTickers.push(homeTicker);

    if (marketTickers.length === 0) return;

    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("Connected to WebSocket");

      // Subscribe to specific tickers for prices
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channel: "prices",
          tickers: marketTickers,
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.channel === "prices") {
        const midPrice = calculateMidPrice(message.yes_bid, message.yes_ask);

        if (midPrice !== null) {
          setRealtimePrices((prev) => ({
            ...prev,
            [message.market_ticker]: midPrice,
          }));
        }
      }
    };

    ws.onerror = (error) => {
      console.error("BuyButtons WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("BuyButtons WebSocket connection closed:", event.code);
    };

    wsRef.current = ws;

    // Cleanup function
    return () => {
      if (wsRef.current) {
        const wsToClose = wsRef.current;
        wsToClose.onopen = null;
        wsToClose.onmessage = null;
        wsToClose.onerror = null;
        wsToClose.onclose = null;
        if (wsToClose.readyState === WebSocket.OPEN) {
          try {
            wsToClose.send(
              JSON.stringify({
                type: "unsubscribe",
                channel: "prices",
                tickers: marketTickers,
              })
            );
          } catch (error) {
            console.error("Error unsubscribing from prices:", error);
          }
        }
        if (
          wsToClose.readyState === WebSocket.OPEN ||
          wsToClose.readyState === WebSocket.CONNECTING
        ) {
          wsToClose.close();
        }
        wsRef.current = null;
      }
    };
  }, [awayTicker, homeTicker]);

  // Ensure team colors have enough contrast on dark background (avoid dark blues/blacks blending in)
  const ensureVisibleOnDark = (hex) => {
    if (!hex || !hex.startsWith("#") || hex.length < 7) return hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum >= 0.35) return hex;
    const mix = (c) => Math.round(Math.min(255, Math.max(0, c * 255 * (0.35 / lum) + 60)));
    return `#${mix(r).toString(16).padStart(2, "0")}${mix(g).toString(16).padStart(2, "0")}${mix(b).toString(16).padStart(2, "0")}`;
  };
  const awayColorRaw = awayTeam?.color || (isDarkMode ? "#3B82F6" : "#2563EB");
  const homeColorRaw = homeTeam?.color || (isDarkMode ? "#10B981" : "#059669");
  const awayColor = isDarkMode ? ensureVisibleOnDark(awayColorRaw) : awayColorRaw;
  const homeColor = isDarkMode ? ensureVisibleOnDark(homeColorRaw) : homeColorRaw;

  const modalTeam =
    buyModalSide === "away"
      ? awayTeam?.code ?? "Away"
      : buyModalSide === "home"
        ? homeTeam?.code ?? "Home"
        : "";
  // Use realtime price, fallback to event market yesBid so modal never shows $0 when market has a price
  const modalPrice =
    buyModalSide === "away"
      ? (awayPrice ?? (awayYesBid ? parseFloat(awayYesBid) : null) ?? 0)
      : buyModalSide === "home"
        ? (homePrice ?? (homeYesBid ? parseFloat(homeYesBid) : null) ?? 0)
        : 0;
  const modalColor = buyModalSide === "away" ? awayColor : homeColor;
  const modalMarket =
    buyModalSide === "away"
      ? { ticker: awayTicker }
      : buyModalSide === "home"
        ? { ticker: homeTicker }
        : null;

  const closeBuyModal = () => {
    setBuyModalVisible(false);
    setBuyModalSide(null);
    setBuyError(null);
  };

  const handleConfirmPurchase = async (payload) => {
    // Use embedded wallet address for trade - must match the wallet that signs the transaction
    const tradeWalletAddress = solanaAddress || userPublicKey;
    console.log("[BuyButtons] handleConfirmPurchase called, payload:", JSON.stringify(payload));
    console.log("[BuyButtons] tradeWalletAddress:", tradeWalletAddress, "solanaAddress:", !!solanaAddress);
    if (!tradeWalletAddress) {
      setBuyError("Connect wallet to complete purchase.");
      return;
    }
    const currentPrice = buyModalSide === "away" ? awayPrice : homePrice;
    if (!currentPrice || currentPrice <= 0) {
      setBuyError("Price data not available. Please wait for market data to load.");
      return;
    }
    if (!payload?.quantity || payload.quantity <= 0 || !payload?.totalCost || payload.totalCost < 0.01) {
      setBuyError("Enter at least 1 share. Minimum trade amount is $0.01.");
      return;
    }

    setBuyError(null);
    setBuySending(true);
    const url = `${API_BASE_URL}/api/trade/buy`;
    const body = {
      amount: payload.totalCost,
      totalCost: payload.totalCost,
      quantity: payload.quantity,
      side: buyModalSide,
      awayTicker,
      homeTicker,
      eventTicker: event?.ticker,
      userPublicKey: tradeWalletAddress,
    };
    const headers = { "Content-Type": "application/json" };
    if (proofToken) headers["x-proof-token"] = proofToken;

    try {
      console.log("[BuyButtons] POST", url, "body:", JSON.stringify(body));
      setBuyError("Preparing transaction...");
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      const text = await response.text();
      console.log("[BuyButtons] Response status:", response.status, "body length:", text?.length);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
        console.log("[BuyButtons] Response parse failed, raw:", text?.slice(0, 200));
      }

      if (!response.ok) {
        setBuyError(data?.error || data?.details?.msg || `Error ${response.status}`);
        setBuySending(false);
        return;
      }

      const transactionBase64 = data?.transaction;
      console.log("[BuyButtons] Got transaction:", !!transactionBase64, "network:", data?.network, "preview:", data?.preview);
      if (!transactionBase64 || typeof transactionBase64 !== "string") {
        const detail = data?.details || data?.error || "";
        setBuyError(detail ? `No transaction: ${detail}` : "No transaction received from server.");
        setBuySending(false);
        return;
      }

      const network = data?.network || "mainnet-beta";
      const rpcUrl = network === "devnet" ? "https://api.devnet.solana.com" : undefined;
      console.log("[BuyButtons] Submitting to", network, "user pays fees");
      setBuyError("Please approve the transaction in your wallet...");
      let signature;
      try {
        const signPromise = signAndSendSolanaTransaction(transactionBase64, {
          ...(rpcUrl ? { rpcUrl } : {}),
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Signing timed out. Please try again.")), 60000)
        );
        signature = await Promise.race([signPromise, timeoutPromise]);
        if (!signature || typeof signature !== "string") {
          throw new Error("No signature returned.");
        }
      } catch (signErr) {
        const msg = signErr?.message || "";
        console.log("[BuyButtons] signAndSend error:", msg);
        if (msg.includes("reject") || msg.includes("cancel")) {
          setBuyError("Transaction was cancelled.");
        } else if (msg.includes("Insufficient") || msg.includes("balance") || msg.includes("debit") || msg.includes("no record of a prior credit") || msg.includes("Simulation failed")) {
          setBuyError("Insufficient USDC. Add funds to your wallet.");
          setBuySending(false);
          Alert.alert(
            "Insufficient Funds",
            `The wallet used for this purchase doesn't have enough USDC on Solana ${network === "devnet" ? "devnet" : "mainnet"} (or its USDC account isn't set up). Make sure the address in Wallet matches the one used here. Would you like to add funds?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Add Funds",
                onPress: () => {
                  closeBuyModal();
                  try {
                    let rootNav = navigation;
                    while (rootNav.getParent()) rootNav = rootNav.getParent();
                    rootNav.navigate("Main", {
                      screen: "Wallet",
                      params: { screen: "Deposit", params: { walletAddress: authWalletAddress || tradeWalletAddress } },
                    });
                  } catch {
                    navigation.navigate("Wallet", { screen: "Deposit", params: { walletAddress: authWalletAddress || tradeWalletAddress } });
                  }
                },
              },
            ]
          );
          return;
        } else {
          setBuyError(msg || "Transaction failed. Please try again.");
        }
        setBuySending(false);
        return;
      }

      setBuyError("Waiting for confirmation...");
      console.log("[BuyButtons] Signature:", signature?.slice(0, 16) + "...", "polling order-status");
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      await delay(1500);
      let orderConfirmed = false;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          if (attempt > 1) await delay(3000);
          console.log("[BuyButtons] Order status attempt", attempt, "of 5");
          const statusRes = await fetch(
            `${API_BASE_URL}/api/trade/order-status?signature=${encodeURIComponent(signature)}`
          );
          const statusText = await statusRes.text();
          const statusData = statusText ? JSON.parse(statusText) : null;
          if (statusData && statusRes.ok) {
            orderConfirmed = true;
            console.log("[BuyButtons] Order confirmed, statusData:", statusData);
            setBuyError("Order confirmed!");
            await delay(1000);
            break;
          }
        } catch {
          if (attempt === 5) setBuyError("Transaction sent. Check your wallet.");
        }
      }

      setBuySending(false);
      if (orderConfirmed) {
        Alert.alert(
          "Transaction Successful",
          `Order confirmed.\n\nSignature: ${signature.slice(0, 16)}...`,
          [{ text: "OK", onPress: closeBuyModal }]
        );
      } else {
        Alert.alert(
          "Transaction Sent",
          `Sent to Solana.\n\nSignature: ${signature.slice(0, 16)}...\n\nIt may take a moment to confirm.`,
          [
            { text: "OK", onPress: closeBuyModal },
          ]
        );
      }
    } catch (err) {
      console.error("Trade error:", err);
      setBuyError(err?.message || "Something went wrong. Please try again.");
      setBuySending(false);
    }
  };

  const iconBg = isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.buttonFill,
              borderColor: awayColor,
            },
          ]}
          onPress={() => {
            setSelectedSide("away");
            if (onSideSelect) onSideSelect("away");
            setBuyModalSide("away");
            setBuyError(null);
            setBuyModalVisible(true);
          }}
        >
          {isBasketball ? (
            <View style={styles.buttonContent}>
              <BasketballIcon
                size={24}
                bgColor={iconBg}
                iconColor="#FFFFFF"
              />
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                {awayTeam?.code ?? "Away"} {displayAwayPrice}
              </Text>
            </View>
          ) : (
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              {awayTeam?.code ?? "Away"} {displayAwayPrice}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.buttonFill,
              borderColor: homeColor,
            },
          ]}
          onPress={() => {
            setSelectedSide("home");
            if (onSideSelect) onSideSelect("home");
            setBuyModalSide("home");
            setBuyError(null);
            setBuyModalVisible(true);
          }}
        >
          {isBasketball ? (
            <View style={styles.buttonContent}>
              <BasketballIcon
                size={24}
                bgColor={iconBg}
                iconColor="#FFFFFF"
              />
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                {homeTeam?.code ?? "Home"} {displayHomePrice}
              </Text>
            </View>
          ) : (
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              {homeTeam?.code ?? "Home"} {displayHomePrice}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <PurchaseModal
        visible={buyModalVisible}
        onClose={() => {
          setBuyModalVisible(false);
          setBuyModalSide(null);
          setBuyError(null);
        }}
        loading={buySending}
        error={buyError}
        team={modalTeam}
        price={modalPrice}
        color={modalColor}
        market={modalMarket}
        onConfirm={handleConfirmPurchase}
      />
    </SafeAreaView>
  );
}
