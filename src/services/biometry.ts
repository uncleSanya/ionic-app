import {NativeBiometric} from "@capgo/capacitor-native-biometric";
import {Capacitor} from "@capacitor/core";

interface VerifyResult
{
    verified: boolean;
}

export async function isBiometryAvailable(): Promise<boolean>
{
    // todo доделать биометрию
    return false;
    if (Capacitor.getPlatform() === "web")
    {
        return false;
    }
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
}

export async function verifyBiometry(): Promise<boolean>
{
    if (Capacitor.getPlatform() === "web")
    {
        return true;
    }
    try
    {
        const result = (await NativeBiometric.verifyIdentity({
            reason: "Вход в приложение",
            title: "Авторизация",
            subtitle: "Подтвердите личность",
        })) as unknown as VerifyResult;

        return result.verified;
    }
    catch
    {
        return false;
    }
}

export async function saveCredentials(username: string, password: string): Promise<void>
{
    await NativeBiometric.setCredentials({
        username,
        password,
        server: "apl-ionic.app",
    });
}

export async function getCredentials(): Promise<{ login: string; password: string } | null>
{
    try
    {
        const creds = await NativeBiometric.getCredentials({server: "apl-ionic.app"});
        return {login: creds.username, password: creds.password};
    }
    catch
    {
        return null;
    }
}

export async function clearCredentials(): Promise<void>
{
    try
    {
        await NativeBiometric.deleteCredentials({server: "apl-ionic.app"});
    }
    catch
    {
        return;
    }
}
