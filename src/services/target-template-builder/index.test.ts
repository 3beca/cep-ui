import { buildTargetFromTemplate } from '.';

test('buildTargetFromTemplate should throw an error if template object is null', async () => {
    expect.assertions(1);
    try {
        await buildTargetFromTemplate('My Target', null as unknown as object, {});
    } catch (error) {
        expect(error.message).toBe('template object must be an object');
    }
});

test('buildTargetFromTemplate should throw an error if template object is undefined', async () => {
    expect.assertions(1);
    try {
        await buildTargetFromTemplate('My Target', undefined as unknown as object, {});
    } catch (error) {
        expect(error.message).toBe('template object must be an object');
    }
});

test('buildTargetFromTemplate should throw an error if template object is not an object', async () => {
    expect.assertions(1);
    try {
        await buildTargetFromTemplate('My Target', 1 as unknown as object, {});
    } catch (error) {
        expect(error.message).toBe('template object must be an object');
    }
});

test('buildTargetFromTemplate should return a target from Telegram Template', async () => {
    const telegramTemplate = {
        url: 'https://api.telegram.org/bot{{token}}/sendMessage',
        headers: {},
        body: {
            chat_id: '{{chatId}}',
            text: '{{text}}'
        }
    };

    const result = await buildTargetFromTemplate('Telegram target', telegramTemplate, {
        token: '123abc',
        chatId: '123',
        text: 'Hi!! I am a bot. Here is your sensor value {{ event.value }}'
    })

    expect(result).toStrictEqual({
        name: 'Telegram target',
        url: 'https://api.telegram.org/bot123abc/sendMessage',
        headers: {},
        body: {
            chat_id: 123,
            text: 'Hi!! I am a bot. Here is your sensor value {{ event.value }}'
        }
    });
});

test('buildTargetFromTemplate should return a target from SendGrid Template', async () => {
    const sendGridTemplate = {
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: {
            authorization: 'Bearer {{apiKey}}'
        },
        body: {
            personalizations: [{
                    to: [{
                        email: '{{toEmail}}'
                    }]
                }],
                from: {
                    email: '{{fromEmail}}',
                    name: '{{fromName}}'
                },
                reply_to: {
                email: '{{replyToEmail}}',
                name: '{{replyToName}}'
            },
            subject: '{{subject}}',
            content: [{
                type: 'text/html',
                value: '{{htmlBody}}'
            }]
        }
    };

    const result = await buildTargetFromTemplate('SendGrid target', sendGridTemplate, {
        apiKey: '123abc',
        toEmail: 'to@example.org',
        fromEmail: 'from@example.org',
        fromName: 'tester',
        replyToEmail: 'no-reply@example.org',
        replyToName: 'no-reply',
        subject: 'Hello! Here is your email',
        htmlBody: '<h1>Hi!! your sensor value is {{ event.value }}</h1>'
    })

    expect(result).toStrictEqual({
        name: 'SendGrid target',
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: {
            authorization: 'Bearer 123abc'
        },
        body: {
            personalizations: [{
                    to: [{
                        email: 'to@example.org'
                    }]
                }],
                from: {
                    email: 'from@example.org',
                    name: 'tester'
                },
                reply_to: {
                email: 'no-reply@example.org',
                name: 'no-reply'
            },
            subject: 'Hello! Here is your email',
            content: [{
                type: 'text/html',
                value: '<h1>Hi!! your sensor value is {{ event.value }}</h1>'
            }]
        }
    });
});

test('buildTargetFromTemplate should throw an error if template makes use of include', async () => {
    expect.assertions(1);
    try {
        const telegramTemplate = {
            url: 'https://api.telegram.org/bot{{token}}/sendMessage',
            headers: {},
            body: {
                chat_id: '{{chatId}}',
                text: 'My {% include "package.json" %}'
            }
        };
        await buildTargetFromTemplate('Telegram target', telegramTemplate, {
            token: '123abc',
            chatId: '123',
            text: 'Hi!! I am a bot. Here is your sensor value {{ event.value }}'
        })
    } catch (error) {
        expect(error.message).toBe('/body/text partials and layouts are not supported, line:1, col:4');
    }
});

test('buildTargetFromTemplate should throw an error if template makes use of render', async () => {
    expect.assertions(1);
    try {
        const telegramTemplate = {
            url: 'https://api.telegram.org/bot{{token}}/sendMessage',
            headers: {},
            body: {
                chat_id: '{{chatId}}',
                text: 'My {% render "package.json" %}'
            }
        };
        await buildTargetFromTemplate('Telegram target', telegramTemplate, {
            token: '123abc',
            chatId: '123',
            text: 'Hi!! I am a bot. Here is your sensor value {{ event.value }}'
        });
    } catch (error) {
        expect(error.message).toBe('/body/text partials and layouts are not supported, line:1, col:4');
    }
});

test('buildTargetFromTemplate should throw an error if template makes use of an invalid tag', async () => {
    expect.assertions(1);
    try {
        const telegramTemplate = {
            url: 'https://api.telegram.org/bot{{token}}/sendMessage',
            headers: {},
            body: {
                chat_id: '{{chatId}}',
                text: 'My {% bla %}'
            }
        };
        await buildTargetFromTemplate('Telegram target', telegramTemplate, {
            token: '123abc',
            chatId: '123',
            text: 'Hi!! I am a bot. Here is your sensor value {{ event.value }}'
        });
    } catch (error) {
        expect(error.message).toBe('/body/text tag "bla" not found, line:1, col:4');
    }
});

test('buildTargetFromTemplate should throw an error if template has invalid syntax', async () => {
    expect.assertions(1);
    try {
        const telegramTemplate = {
            url: 'https://api.telegram.org/bot{{token}}/sendMessage',
            headers: {},
            body: {
                chat_id: '{{chatId',
                text: 'My text'
            }
        };
        await buildTargetFromTemplate('Telegram target', telegramTemplate, {
            token: '123abc',
            chatId: '123',
            text: 'Hi!! I am a bot. Here is your sensor value {{ event.value }}'
        });
    } catch (error) {
        expect(error.message).toBe('/body/chat_id output "{{chatId" not closed, line:1, col:1');
    }
});

test('buildTargetFromTemplate should return target replacing with empty string when variable does not exist in the model', async () => {
    const telegramTemplate = {
        url: 'https://api.telegram.org/bot{{token}}/sendMessage',
        headers: {},
        body: {
            chat_id: '{{chatId}}',
            text: 'My text'
        }
    };

    const result = await buildTargetFromTemplate('Telegram target', telegramTemplate, {
        token: '123abc'
    });

    expect(result).toStrictEqual({
        name: 'Telegram target',
        url: 'https://api.telegram.org/bot123abc/sendMessage',
        headers: {},
        body: {
            chat_id: '',
            text: 'My text'
        }
    });
});

test('buildTargetFromTemplate should return target skip invalid filters', async () => {
    const telegramTemplate = {
        url: 'https://api.telegram.org/bot{{token}}/sendMessage',
        headers: {},
        body: {
            chat_id: '{{chatId}}',
            text: 'Hello {{text | invalidFilter | capitalize }}'
        }
    };

    const result = await buildTargetFromTemplate('Telegram target', telegramTemplate, {
        token: '123abc',
        chatId: 123456,
        text: 'world'
    });

    expect(result).toStrictEqual({
        name: 'Telegram target',
        url: 'https://api.telegram.org/bot123abc/sendMessage',
        headers: {},
        body: {
            chat_id: 123456,
            text: 'Hello World'
        }
    });
});

test('buildTargetFromTemplate should return target applying valid filters', async () => {
    const telegramTemplate = {
        url: 'https://api.telegram.org/bot{{token}}/sendMessage',
        headers: {},
        body: {
            chat_id: '{{chatId}}',
            text: 'Hello {{text | upcase }}'
        }
    };

    const result = await buildTargetFromTemplate('Telegram target', telegramTemplate, {
        token: '123abc',
        chatId: 123456,
        text: 'world'
    });

    expect(result).toStrictEqual({
        name: 'Telegram target',
        url: 'https://api.telegram.org/bot123abc/sendMessage',
        headers: {},
        body: {
            chat_id: 123456,
            text: 'Hello WORLD'
        }
    });
});

test('buildTargetFromTemplate should return target without altering number values in template', async () => {
    const telegramTemplate = {
        url: 'https://api.telegram.org/bot{{token}}/sendMessage',
        headers: {},
        body: {
            chat_id: 123,
            text: 'Hello'
        }
    };

    const result = await buildTargetFromTemplate('Telegram target', telegramTemplate, {
        token: '123abc',
        chatId: 123456
    });

    expect(result).toStrictEqual({
        name: 'Telegram target',
        url: 'https://api.telegram.org/bot123abc/sendMessage',
        headers: {},
        body: {
            chat_id: 123,
            text: 'Hello'
        }
    });
});