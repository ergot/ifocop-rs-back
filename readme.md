# Publications sur le profil
Nous traitons ici des messages publiés dans l’espace particulier du membre

| Taches | Visiteur | Membres | Admins |
| ----- | -------- | ------- | ------ |
| publier un message sur son profil | X | V |V|
| publier un message sur le profil d’un ami | X | V |V|
| publier un message sur le profil de n'importe quel membre | X | X |V|
| répondre à un message publié sur son profil | X | V |V|
| répondre à un message publié sur le profil d’un ami | X | V |V|
| répondre à un message publié sur le profil de n'importe quel membre | X | X |V|
| supprimer un message que j’ai publié sur le profil d’un ami | X | V |V|
| supprimer un message sur le profil de n'importe quel membre | X | X |V|

## Gestion de l’affichage
La publication sur le profil, la réponse à un message et la suppression se
feront sans rafraîchissement de la page (méthode asynchrone).

# Liste d’amis
Cette liste n’affiche que les membres avec le statut « Confirmé ».

## A/ Ajouter un utilisateur à la liste d’amis
Dans cette liste apparaissent seulement les membres n’appartenant pas à la
liste d’amis [X] ou qui n’ont pas reçu d’invitation pour appartenir à la liste d’amis. []

1. Le membre demandeur clique sur un nom de la liste. [X] []
2. Le membre choisi, receveur, est ajouté à la liste d’amis du membre
demandeur avec le statut « invitation en cours ». [X] []
3. Le membre demandeur est ajouté à la liste d’amis du receveur avec le
statut « en attente de confirmation ». [X] []
4. Un mail est envoyé au membre choisi pour lui signaler l’invitation. [X] []
5. Un message est affiché au membre demandeur pour lui indiquer que la
demande a été envoyée. [] []

## B/ Valider une demande d’ajout à la liste d’amis
Cette option n’apparaît que sur les profils de membres appartenant à la liste
d’amis avec le statut « en attente de confirmation ».

1. Le membre receveur est ajouté à la liste d’amis du membre demandeur
avec le statut « Confirmé ». [X][]
2. Le membre demandeur est ajouté à la liste d’amis du membre receveur
avec le statut « Confirmé ».[X][]
3. Un message est affiché pour indiquer que la demande a été confirmée.[][]

## C/ Ignorer une demande d’ajout à la liste d’amis
Cette option n’apparaît que sur les profils de membres appartenant à la liste
d’amis avec le statut « en attente de confirmation ».

1. Le membre est de la liste d’amis du membre demandeur.[X][]
2. Retire le membre de la liste d’amis du membre receveur.[X][]
3. Affiche un message pour indiquer que la demande a été ignorée.[][]

# Recommandation

## Recommander un ajout à la liste d’amis
Cette option n’apparaît que sur les profils de membres appartenant à la
liste d’amis avec le statut «confirmé».

1. Une liste de sélection s’affiche avec la liste d’amis possédant le
statut «confirmé».[X][]
2. Si le membre sélectionne un ami, celui-ci est ajouté à la liste
d’amis de l’ami avec le statut «
recommandé » et l’identifiant du membre à l’origine de la recommandation.[X][]
3. Une notification est envoyée par mail à l’adresse du membre pour lui
signaler la recommandation.[X][]
4. Un message est affiché au membre qui a fait la recommandation pour
indiquer que celle-ci a été envoyée.[][]

## Valider une recommandation d’ajout à la liste d’amis
Cette option apparaît dans le profil de l'utilisateur uniquement sur les
utilisateurs appartenant à la liste d’amis avec le statut « recommandé »
et l’identifiant de l’utilisateur à l’origine de la recommandation.

1. c.f. Ajouter un ami à la liste d’amis. [X][]

## Ignorer une recommandation d’ajout à la liste d’amis
Cette option apparaît dans le profil du membre uniquement sur les membres
appartenant à la liste d’amis avec le statut «recommandé» et
l’identifiant de membre à l’origine de la recommandation.

1. c.f. Ignorer une demande d’ajout à la liste d’amis.[X][]
