import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, Debug, Log } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';
import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
import { isVisible, Value } from '@serenity-js/web';
import axios from 'axios';

import { TODO_ITEMS } from './todo-list-app/test-data';
import {
    footerSection,
    mainSection,
    newTodoInput,
    outstandingItemsCount,
    persistedItemCalled,
    persistedItemNames,
    persistedItems,
    startWithAListContaining,
    startWithAnEmptyList,
} from './todo-list-app/TodoApp';
import { recordItem } from './todo-list-app/TodoItem';
import { itemNames } from './todo-list-app/TodoList';

describe('Recording items', () => {

    /*     describe('Todo List App', () => {
        it('primera petición', async () => {
            const httpClient = axios.create({ baseURL: 'https://dummyjson.com' })
            actorCalled('Apisitt')
                .whoCan(CallAnApi.using(httpClient))
                .attemptsTo(
                    Send.a(GetRequest.to('/products/1')),
                )
        })
    })
 */
    /**
     * You can override the default actor name and the Serenity/JS "crew" in playwright.config.ts,
     * or in the test scenarios themselves.
     */
    // test.use({
    //     defaultActorName: 'Serena',
    //     crew: [
    //         Photographer.whoWill(TakePhotosOfFailures),
    //         // Photographer.whoWill(TakePhotosOfInteractions),
    //     ],
    // });

    describe('Todo List App', () => {

        it('primera petición', async () => {
            const httpClient = axios.create({ baseURL: 'https://dummyjson.com' })
            const julia =  actorCalled('Apisitt')
                .whoCan(CallAnApi.using(httpClient))

            await julia
                .attemptsTo(
                    Send.a(GetRequest.to('/products/1')),
                    Debug.values((result, some, some1) => {
                        // set a breakpoint anywhere inside this function
                        console.log('1')
                        const a = some1
                        const b = result[1].description
                    
                    },
                    Ensure.that( LastResponse.status(), equals(200)),
                    Log.the('current body', LastResponse.body(), LastResponse.status()),
                    ),
                )

            CallAnApi.as(julia).mapLastResponse((response) => {
                console.log('3')
                console.log(response.data)
            })

            console.log('2')
            console.log(LastResponse.body())
        })

        it('should allow me to add todo items', async ({ actor }) => {
            console.log(actor)
            await actor.attemptsTo(
                startWithAnEmptyList(),

                recordItem(TODO_ITEMS[0]),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                ])),

                recordItem(TODO_ITEMS[1]),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                    TODO_ITEMS[1],
                ])),

                // note that `equals` and all the other expectations accept
                // either a static value or an Answerable
                Ensure.that(persistedItemNames(), equals(itemNames())),
            );
        });

        it('should clear text input field when an item is added', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAnEmptyList(),

                recordItem(TODO_ITEMS[0]),

                Ensure.that(Value.of(newTodoInput()), equals('')),

                Ensure.that(persistedItemCalled(TODO_ITEMS[0]).name, equals(TODO_ITEMS[0])),
                Ensure.that(persistedItemCalled(TODO_ITEMS[0]).completed, equals(false)),
            );
        });

        it('should reflect the number of items left in the counter', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(...TODO_ITEMS),

                Ensure.that(outstandingItemsCount(), equals(TODO_ITEMS.length)),
                Ensure.that(persistedItems().length, equals(TODO_ITEMS.length)),
            );
        });

        it('should show #main and #footer sections only when list contains items', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAnEmptyList(),

                Ensure.that(mainSection(), not(isPresent())),
                Ensure.that(footerSection(), not(isPresent())),

                recordItem(TODO_ITEMS[0]),

                Ensure.that(mainSection(), isVisible()),
                Ensure.that(footerSection(), isVisible()),
            );
        });
    });
});
