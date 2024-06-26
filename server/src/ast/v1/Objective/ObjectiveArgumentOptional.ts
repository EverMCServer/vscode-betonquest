
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import { ObjectiveArgumentOptionalType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ObjectiveArguments } from "./ObjectiveArguments";

export class ObjectiveArgumentOptional extends AbstractNodeV1<ObjectiveArgumentOptionalType> {
  readonly type: ObjectiveArgumentOptionalType = 'ObjectiveArgumentOptional'; // TODO remove Mandatory / Optional
  offsetStart?: number;
  offsetEnd?: number;
  readonly parent: ObjectiveArguments;

  argumentStr: string;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
    parent: ObjectiveArguments,
  ) {
    super();
    this.parent = parent;

    this.offsetStart = range[0];
    this.offsetEnd = range[1];

    // Parse argumentStr
    this.argumentStr = argumentStr;

    // Check format
  }
}

