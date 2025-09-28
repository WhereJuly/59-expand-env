'use strict';

function extractPlaceholderAndBehaviors(input: string, allowedBehaviors: string[]): [string, string[]] {
    /**
     * Regular expression to match the placeholder and behaviors
     * @see: regexr.com/7utvp with tests
     * 
     * `match[1]` is the placeholder;
     * `match[2]` is optional comma-separated behaviors string;
     */
    const regex = /\${([^|]+)}(?:\|-){0,1}([\w,]+){0,1}/g;

    // Executing the regular expression on the input string
    const match = regex.exec(input);

    if (!match) {
        throw new Error('Invalid input string');
    }

    // Extracting the placeholder and behaviors from the regex match
    const placeholder = match[1];
    const behaviors = match[2].split(',').filter((behavior: string) => {
        return allowedBehaviors.includes(behavior);
    });

    console.log('match: ');
    console.log(match);

    return [placeholder, behaviors];
}

const input = "${JWT_EXPIRY}|-int,silent,anotherBehavior,yetAnotherBehavior";
const allowedBehaviors = ['int', 'bool', 'silent'];
const [placeholder, behaviors] = extractPlaceholderAndBehaviors(input, allowedBehaviors);

console.log("Placeholder:", placeholder);
console.log("Behaviors:", behaviors);
