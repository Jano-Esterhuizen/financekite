using System;

namespace FinanceKite.API.Extensions;

using System.Security.Claims;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        // Supabase puts the user's UUID in the 'sub' claim (subject)
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub")
            ?? throw new InvalidOperationException("User ID claim not found in token.");

        return Guid.Parse(sub);
    }
}

/*
What is a claim? A claim is a statement about the user baked into their JWT token. 
Supabase includes the user's UUID as the sub (subject) claim — a JWT standard. 
We try both ClaimTypes.NameIdentifier (the .NET mapped version) and the raw "sub" string to be safe across different JWT configurations.
*/
