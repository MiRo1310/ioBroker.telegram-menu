import type { Adapter, GeneratedActions } from '@b/types/types';

export const regexIdText = /\{\s*'id':'[^']*'[\s\S]*?'text':'[^']*'\s*}/;

export const findDeprecatedAndLog = (adapter: Adapter, actions?: GeneratedActions): void => {
    const actionsAsString = JSON.stringify(actions);

    if (regexIdText.test(actionsAsString)) {
        adapter.log.warn(
            'You are using a no longer functioning way to set the return text. Please change it to the new way. Old way: {\'id\':\'adapter.0.example\', \'text\':\'Text\'}. New way: {"foreignId":"adapter.0.example","text":"Text"}',
        );
    }
};
