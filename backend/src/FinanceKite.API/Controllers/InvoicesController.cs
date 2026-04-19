using System;

namespace FinanceKite.API.Controllers;

using FinanceKite.Application.Features.Invoices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

[Route("api/businesses/{businessId:guid}/invoices")]
public class InvoicesController(InvoiceService invoiceService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid businessId, CancellationToken cancellationToken)
    {
        var result = await invoiceService.GetAllAsync(businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        var result = await invoiceService.GetByIdAsync(id, businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdue(Guid businessId, CancellationToken cancellationToken)
    {
        var result = await invoiceService.GetOverdueAsync(businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid businessId,
        [FromBody] CreateInvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await invoiceService.CreateAsync(businessId, CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { businessId, id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid businessId,
        Guid id,
        [FromBody] UpdateInvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await invoiceService.UpdateAsync(id, businessId, CurrentUserId, request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/upload-document")]
    [EnableRateLimiting("uploads")]
    public async Task<IActionResult> UploadDocument(
        Guid businessId,
        Guid id,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var result = await invoiceService.UploadDocumentAsync(id, businessId, CurrentUserId, file, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        await invoiceService.DeleteAsync(id, businessId, CurrentUserId, cancellationToken);
        return NoContent();
    }

    [HttpGet("{id:guid}/document-url")]
    public async Task<IActionResult> GetDocumentUrl(
    Guid businessId,
    Guid id,
    [FromQuery] bool download = false,
    CancellationToken cancellationToken = default)
    {
        var url = await invoiceService.GetDocumentUrlAsync(
            id, businessId, CurrentUserId, cancellationToken);

        return Ok(new { url, download });
    }

    [HttpDelete("{id:guid}/document")]
    public async Task<IActionResult> DeleteDocument(
    Guid businessId,
    Guid id,
    CancellationToken cancellationToken)
    {
        await invoiceService.DeleteDocumentAsync(id, businessId, CurrentUserId, cancellationToken);
        return NoContent();
    }
}
