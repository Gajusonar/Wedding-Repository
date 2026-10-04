<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep invitation data in shareable URL parameters and the editing form rather than a server store, so each guest receives a personalized link without an account.
- Keep share links short: pack only fields that differ from the starter into one lz-string-compressed `d` param, keep `guest` and `invite` plain, and keep reading legacy flat field params for back-compat.
- Treat uploaded music as local preview only and use a direct audio URL for shareable playback, because browser file objects cannot travel inside invitation links.
