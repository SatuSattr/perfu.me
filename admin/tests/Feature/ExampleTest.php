<?php

test('login page returns ok for guest', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('dashboard redirects guest to login', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});
