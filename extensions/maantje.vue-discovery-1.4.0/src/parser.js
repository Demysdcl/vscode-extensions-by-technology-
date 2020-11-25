class Parser {
    constructor(content) {
        this.content = content;
        this.parsed = {
            template: null,
            script: null,
            props: null,
            mixins: null,
            events: null,
        };
    }
    getContentBetweenTag(tag) {
        const tagStart = `<${tag}`;
        const tagEnd = `</${tag}>`;

        const indexOfTagStart = this.content.indexOf(tagStart);
        const indexOfTagEnd = this.content.indexOf(tagEnd);

        // Can't find the tag
        if (indexOfTagStart === -1 || indexOfTagEnd === -1) {
            return null;
        }

        return this.content.substring(indexOfTagStart, indexOfTagEnd + tagEnd.length);
    }
    getPositionOfStartAndEnd(content, startCharacter, endCharacter) {
        const position = {
            start: null,
            end: null,
        };

        let starts = 0;
        let index = 0;

        while ((starts !== 0 || position.start === null) && index < content.length) {
            const character = content[index];

            if (character === startCharacter) {
                if (position.start === null) {
                    position.start = index;
                }

                ++starts;
            }

            if (character === endCharacter) {
                --starts;
            }

            ++index;
        }

        position.end = index;

        return position;
    }
    startAtAndGetPositionOfStartAndEnd(content, search, start, end) {
        const indexOfStart = content.indexOf(search);

        // Can't find start of mixins
        if (indexOfStart === -1) {
            return { content: null, start: null, end: null };
        }

        const contentAtStart = content.substring(indexOfStart, content.length);

        return { content: contentAtStart, ...this.getPositionOfStartAndEnd(contentAtStart, start, end) };
    }
    attributeWithObjectNotation(attribute) {
        const { content, start, end } = this.startAtAndGetPositionOfStartAndEnd(this.parsed.script, `${attribute}:`, '{', '}');

        if (!content || !start || !end) {
            return null;
        }

        return content.substring(start, end);
    }
    attributeWithArrayNotation(attribute) {
        const { content, start, end } = this.startAtAndGetPositionOfStartAndEnd(this.parsed.script, `${attribute}:`, '[', ']');

        if (!content || !start || !end) {
            return null;
        }

        return content.substring(start + 1, end - 1)
            .split(',')
            .map(mixin => mixin.trim());
    }
    mixins() {
        this.parsed.mixins = this.attributeWithArrayNotation('mixins');

        return this;
    }
    props() {
        const props = this.attributeWithObjectNotation('props');

        if (props) {
            try {
                this.parsed.props = eval(`(${props})`);
            } catch (e) {
                this.parsed.props = null;
            }

            return this;
        }

        // If we did not find any props as object lets try again for array
        this.parsed.props = this.attributeWithArrayNotation('props');

        return this;
    }
    events() {
        const events = this.content.match(/\$emit\(['"][A-Za-z]+/g);

        this.parsed.events = (events || []).map(event => event.slice(7, event.length));

        return this;
    }
    template() {
        this.parsed.template = this.getContentBetweenTag('template');

        return this;
    }
    script() {
        const { content, start, end } = this.startAtAndGetPositionOfStartAndEnd(this.content, 'export default', '{', '}');

        if (!content || !start || !end) {
            return null;
        }

        this.parsed.script = content.substring(start, end);

        return this;
    }
    parse() {
        this.template()
            .script()
            .mixins()
            .props()
            .events();

        return this.parsed;
    }
}


module.exports = Parser;