import { Scalar, YAMLMap, parseDocument } from "yaml";
import { Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { NodeV1, NodeType } from "../node";
import { PackageV1 } from "./Package";

export abstract class Document<T extends NodeType> extends NodeV1<T> {
  uri: string;
  protected parent: PackageV1;

  // VSCode Document, for diagnostics / quick actions / goto definition, etc
  document: TextDocument;
  yml: YAMLMap<Scalar<string>>;

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super();

    this.uri = uri;
    this.parent = parent;
    this.document = document;

    // Parse yaml
    const yamlDoc = parseDocument<YAMLMap<Scalar<string>>, false>(
      document.getText(),
      {
        keepSourceTokens: true,
        strict: false
      }
    );

    this.yml = yamlDoc.contents;

    // Extract offsets
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];
  }

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return {
      start: this.document.positionAt(offsetStart),
      end: this.document.positionAt(offsetEnd)
    } as Range;
  }
}