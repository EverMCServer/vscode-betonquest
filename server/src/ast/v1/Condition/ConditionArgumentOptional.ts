
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import { ConditionArgumentOptionalType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ConditionArguments } from "./ConditionArguments";

export class ConditionArgumentOptional extends AbstractNodeV1<ConditionArgumentOptionalType> {
  readonly type: ConditionArgumentOptionalType = 'ConditionArgumentOptional'; // TODO remove Mandatory / Optional
  offsetStart?: number;
  offsetEnd?: number;
  readonly parent: ConditionArguments;

  argumentStr: string;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
    parent: ConditionArguments,
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

