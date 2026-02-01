// SpamFlood.plugin.tsx
/**
 * @name SpamFlood
 * @description UI-powered spammer
 * @version 0.3.0
 * @author Jayden
 */

import { definePlugin } from "@utils/types"; // or wherever Revenge exposes it — common in @vendetta/types or similar
import { findByProps, findByName } from "@webpack";
import { Button, Forms, TextInput } from "@components"; // common aliases in Revenge plugins
import { React, FluxDispatcher, FluxStores } from "@webpack/common";
import type { ReactNode } from "react";

// Grab Discord's internal stores & send fn
const MessageActions = findByProps("sendMessage");
const ChannelStore = findByProps("getChannelId", "getChannel");
const useCurrentChannelId = () => ChannelStore?.getChannelId?.() ?? null;

// State management (simple module-level for spam control)
let isSpamming = false;
let spamInterval: NodeJS.Timeout | null = null;

const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

async function startSpam(
    channelId: string,
    message: string,
    count: number,
    delay: number
): Promise<void> {
    if (isSpamming) return;
    isSpamming = true;

    let sent = 0;

    const spamLoop = async () => {
        while (sent < count && isSpamming) {
            try {
                await MessageActions.sendMessage(channelId, {
                    content: `\( {message} [ \){sent + 1}/${count}]`.trim(),
                });
                sent++;
            } catch (err) {
                console.error("[SpamFlood] Send failed 😭", err);
                break;
            }
            await sleep(delay);
        }
        stopSpam();
    };

    spamLoop();
}

function stopSpam(): void {
    isSpamming = false;
    if (spamInterval) {
        clearInterval(spamInterval);
        spamInterval = null;
    }
}

export default definePlugin({
    name: "SpamFlood",
    description: "UI that lets you spam messages",
    authors: [{ name: "Your bad boy", id: 0n }], // id can be fake/0n

    patches: [], // add patches later if you want to force-bypass more limits

    // Sexy settings panel in Plugins → SpamFlood settings
    settings: {
        render(): ReactNode {
            const [message, setMessage] = React.useState<string>("uwu Jayden was here <3");
            const [count, setCount] = React.useState<number>(10);
            const [delay, setDelay] = React.useState<number>(1500);
            const [running, setRunning] = React.useState<boolean>(isSpamming);

            React.useEffect(() => {
                setRunning(isSpamming);
            }, [isSpamming]);

            const toggleSpam = (): void => {
                const channelId = useCurrentChannelId();

                if (!channelId) {
                    alert("you're not in a channel rn~ Go to a chat first ");
                    return;
                }

                if (running) {
                    stopSpam();
                } else {
                    if (count < 1 || count > 50) {
                        alert("Keep count between 1-50 bb, or Discord will eat your account alive");
                        return;
                    }
                    if (delay < 500 || delay > 10000) {
                        alert("Delay 500-10000ms pls~ Too fast = insta ban vibes");
                        return;
                    }
                    startSpam(channelId, message, count, delay);
                }
                setRunning(!running);
            };

            return (
                <Forms.FormSection title="Jayden's Spam UI 🔥">
                    <Forms.FormText tag="h5">Message to flood the server with~</Forms.FormText>
                    <TextInput
                        value={message}
                        onChange={(v: string) => setMessage(v)}
                        placeholder="Your naughty text here..."
                        autoFocus
                    />

                    <Forms.FormDivider style={{ margin: "12px 0" }} />

                    <Forms.FormText tag="h5">How many times? (1-50 max)</Forms.FormText>
                    <TextInput
                        value={count.toString()}
                        onChange={(v: string) => {
                            const num = Number(v);
                            if (!isNaN(num)) setCount(Math.max(1, Math.min(50, num)));
                        }}
                        keyboardType="numeric"
                    />

                    <Forms.FormDivider style={{ margin: "12px 0" }} />

                    <Forms.FormText tag="h5">Delay between messages (ms)</Forms.FormText>
                    <TextInput
                        value={delay.toString()}
                        onChange={(v: string) => {
                            const num = Number(v);
                            if (!isNaN(num)) setDelay(Math.max(500, Math.min(10000, num)));
                        }}
                        keyboardType="numeric"
                    />

                    <Forms.FormDivider style={{ margin: "16px 0" }} />

                    <Button
                        text={running ? "STOP SPAM" : "START SPAM"}
                        color={running ? Button.Colors.RED : Button.Colors.GREEN}
                        size={Button.Sizes.LARGE}
                        onClick={toggleSpam}
                        style={{ width: "100%", marginTop: 8 }}
                    />

                    <Forms.FormText
                        type={Forms.FormText.Types.DANGER}
                        style={{ textAlign: "center", marginTop: 12, fontSize: 13 }}
                    >
                        Use throwaway accounts only~ Discord hates spammers in 2026
                    </Forms.FormText>
                </Forms.FormSection>
            );
        },
    },

    start(): void {
        console.log(
            "%c[SpamFlood] Is on",
            "color:#ff69b4; font-weight:bold; font-size:14px;"
        );
    },

    stop(): void {
        stopSpam();
        console.log("[SpamFlood] Shutting down");
    },
});
