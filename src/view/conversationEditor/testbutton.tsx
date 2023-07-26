import * as React from "react";
import { vscode } from "./vscode";

interface TestButtonProps {
    yml: string;
}

// export default function testButton(vscode: undefined) {
export default function testButton({yml} : TestButtonProps) {

    let updatedYml:string = yml!;
    updatedYml = updatedYml + "\n\n# test";
    console.log("updated yml:", updatedYml);

    return (
        <>
        <script>
        </script>
        {/* test send message to vscode */}
        <button onClick={()=>{sendMsgToVscode("test-from-webview", "hi");}}>Send message from React to VSCode</button>
        {/* update editted yml file to vscode */}
        <button onClick={()=>{sendMsgToVscode("edit", updatedYml);}}>Update file</button>
        </>
    );
}

function sendMsgToVscode( type: string, message: string) {
    console.log("button clicked");
    vscode.postMessage({
        type: type,
        message: message
    });
}