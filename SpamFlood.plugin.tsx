// ==UserScript==
// @name         SpamFlood
// @description  UI that lets you spam
// @version      0.2.0
// @author       Jayden
// ==/UserScript==

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { findByProps } from "@webpack";
import { Button, Forms, TextInput, Switch, Flex } from "@components";  // Revenge/Vendetta usually exposes these
import { React } from "@webpack/common";

const { Settings: { SettingGroup, SettingDivider } } = findByProps("SettingGroup"); // or similar path

let isSpamming = false;
let spamInterval: NodeJS.Timeout | null = null;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function startSpam(channelId: string, message: string, count: number, delay: number) {
    if (isSpamming) return;
    isSpamming = true;

    let sent = 0;
    spamInterval = setInterval(async () => {
        if (sent >= count || !isSpamming) {
            stopSpam();
            return;
        }
        try {
            // Use Revenge's sendMessage wrapper (adjust if needed based on your Revenge version)
            await Vencord.Plugins.plugins?.SpamFlood?.sendMessage?.({ channelId, content: message + (count > 5 ? ` [\( {sent+1}/ \){count}]` : "") });
            sent++;
        } catch (e) {
            console.error("Spam oopsie bb", e);
            stopSpam();
        }
    }, delay);
}

function stopSpam() {
    isSpamming = false;
    if (spamInterval) clearInterval(spamInterval);
    spamInterval = null;
}

export default definePlugin({
    name: "SpamFlood",
    description: "UI chaos spammer for Jayden~ Flood with love and zero regrets 😏",
    authors: [Devs.yourWaifu],

    // Settings UI panel (shows in Plugins > SpamFlood > gear icon or settings tab)
    settings: {
        render: () => {
            const [msg, setMsg] = React.useState("uwu spam from Jayden <3");
            const [cnt, setCnt] = React.useState(10);
            const [dly, setDly] = React.useState(1500);
            const [running, setRunning] = React.useState(false);

            React.useEffect(() => {
                setRunning(isSpamming);
            }, [isSpamming]);

            const toggleSpam = () => {
                const channel = /* get current channel id - you may need to patch/find Flux stores for this */
                    // For simplicity, assume you're in a channel; in real use patch ChannelStore.getChannelId()
                    "1412851736846143569"; // REPLACE WITH actual getter if you patch it

                if (running) {
                    stopSpam();
                } else {
                    startSpam(channel, msg, cnt, dly);
                }
                setRunning(!running);
            };

            return (
                <SettingGroup title="Spam Controls">
                    <Forms.FormText>Message to spam bb~</Forms.FormText>
                    <TextInput
                        value={msg}
                        onChange={v => setMsg(v)}
                        placeholder="Enter your naughty text..."
                    />

                    <Forms.FormDivider />

                    <Forms.FormText>Count (1-50)</Forms.FormText>
                    <TextInput
                        value={cnt.toString()}
                        onChange={v => setCnt(Math.min(50, Math.max(1, Number(v) || 10)))}
                        keyboardType="numeric"
                    />

                    <Forms.FormDivider />

                    <Forms.FormText>Delay ms (1200-5000, lower = riskier)</Forms.FormText>
                    <TextInput
                        value={dly.toString()}
                        onChange={v => setDly(Math.min(5000, Math.max(500, Number(v) || 1500)))}
                        keyboardType="numeric"
                    />

                    <SettingDivider />

                    <Flex justify="center" style={{ marginTop: 16 }}>
                        <Button
                            color={running ? Button.Colors.RED : Button.Colors.GREEN}
                            onClick={toggleSpam}
                        >
                            {running ? "STOP SPAMMING" : "START SPAMMING"}
                        </Button>
                    </Flex>

                    <Forms.FormText type="danger" style={{ textAlign: "center", marginTop: 8 }}>
                        Use in YOUR server only or on throwaway acc~ Discord sniffs hard in 2026
                    </Forms.FormText>
                </SettingGroup>
            );
        }
    },

    start() {
        console.log("%c[SpamFlood UI] Ready to destroy", "color:#ff1493;font-weight:bold");
    },

    stop() {
        stopSpam();
        console.log("[SpamFlood] Shutting down...");
    }
});
